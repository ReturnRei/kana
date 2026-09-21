const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, readFileSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const ts = require("typescript");

// Run the TypeScript helpers with Node's test runner, without another test dependency.
const directory = mkdtempSync(join(tmpdir(), "kana-tests-"));
let selection, kana;
try {
  for (const name of ["kana", "selection"]) {
    const source = readFileSync(join(__dirname, `../src/utilities/${name}.ts`), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
    });
    writeFileSync(join(directory, `${name}.js`), outputText);
  }
  selection = require(join(directory, "selection.js"));
  kana = require(join(directory, "kana.js"));
} finally {
  rmSync(directory, { recursive: true, force: true });
}
const { parseKanaSelection, initialKanaSelection, setKanaSelection, kanaSelectionState } = selection;

test("URL selects only the specified kana across scripts", () => {
  assert.deepEqual(initialKanaSelection("?kanas=らリ"), ["ら", "リ"]);
  assert.deepEqual(initialKanaSelection("?kanas=%E3%82%89%E3%83%AA"), ["ら", "リ"]);
});

test("compounds are indivisible and do not select their base kana", () => {
  assert.deepEqual(parseKanaSelection("きゃシュりょ"), ["きゃ", "シュ", "りょ"]);
  assert.deepEqual(parseKanaSelection("ききゃキキャ"), ["き", "きゃ", "キ", "キャ"]);
  assert.deepEqual(parseKanaSelection("じゃぢゃジャヂャ"), ["じゃ", "ぢゃ", "ジャ", "ヂャ"]);
});

test("every supported kana, including every compound, round-trips through a URL", () => {
  for (const char of Object.keys(kana.kanaMap)) {
    assert.deepEqual(initialKanaSelection(`?kanas=${encodeURIComponent(char)}`), [char]);
  }
  const all = Object.keys(kana.kanaMap);
  assert.deepEqual(parseKanaSelection(all.join("")), all);
});

test("normalizes decomposed dakuten and ignores duplicates and unsupported text", () => {
  assert.deepEqual(parseKanaSelection("き\u3099ゃ キ\u3099ュ, らら / リ!abc🙂"), ["ぎゃ", "ギュ", "ら", "リ"]);
});

test("separators and repeated parameters do not accidentally create compounds", () => {
  assert.deepEqual(initialKanaSelection("?kanas=き&kanas=ゃ&kanas=シュ"), ["き", "シュ"]);
  assert.deepEqual(parseKanaSelection("き ゃ"), ["き"]);
});

test("missing parameter keeps defaults; empty or invalid selection stays empty", () => {
  assert.deepEqual(initialKanaSelection(""), ["あ", "い", "う", "え", "お"]);
  assert.deepEqual(initialKanaSelection("?kanas="), []);
  assert.deepEqual(initialKanaSelection("?kanas=abc🙂"), []);
});

test("individual selections work from empty and can be cleared", () => {
  assert.deepEqual(setKanaSelection([], ["きゃ"], true), ["きゃ"]);
  assert.deepEqual(setKanaSelection(["きゃ"], ["きゃ"], false), []);
});

test("group selection supports individual overrides and preserves other scripts", () => {
  const group = ["きゃ", "きゅ", "きょ"];
  const original = ["リ"];
  const selected = setKanaSelection(original, group, true);
  assert.deepEqual(selected, ["リ", ...group]);
  assert.deepEqual(kanaSelectionState(selected, group), { checked: true, indeterminate: false });
  const partial = setKanaSelection(selected, ["きゅ"], false);
  assert.deepEqual(partial, ["リ", "きゃ", "きょ"]);
  assert.deepEqual(kanaSelectionState(partial, group), { checked: false, indeterminate: true });
  assert.deepEqual(setKanaSelection(partial, group, true), ["リ", "きゃ", "きょ", "きゅ"]);
  assert.deepEqual(setKanaSelection(partial, group, false), ["リ"]);
  assert.deepEqual(original, ["リ"]);
});

test("practice stream never emits kana outside a mixed compound selection", () => {
  const selected = parseKanaSelection("らリきゃシュ");
  const stream = kana.spacedRepetitionStream(selected.map((char) => ({ kana: char, romaji: kana.kanaMap[char] })));
  const seen = new Set();
  for (let i = 0; i < 100; i++) {
    const current = stream.next().kana;
    assert.ok(selected.includes(current));
    seen.add(current);
    if (i % 3 === 0) stream.onFail();
  }
  assert.equal(seen.size, selected.length);
  const single = kana.spacedRepetitionStream(["きゃ"]);
  for (let i = 0; i < 20; i++) {
    assert.equal(single.next(), "きゃ");
    single.onFail();
  }
});
