import { KanaChars, kanaMap } from "./kana";

const knownKana = (Object.keys(kanaMap) as KanaChars[]).sort((a, b) => b.length - a.length);

/** Match compounds before single kana; separators and unsupported characters are ignored. */
export function parseKanaSelection(value: string): KanaChars[] {
  const text = value.normalize("NFC");
  const selected = new Set<KanaChars>();
  for (let i = 0; i < text.length; ) {
    const match = knownKana.find((kana) => text.startsWith(kana, i));
    if (match) selected.add(match);
    i += match?.length ?? 1;
  }
  return [...selected];
}

export function initialKanaSelection(search: string): KanaChars[] {
  const params = new URLSearchParams(search);
  return params.has("kanas") ? parseKanaSelection(params.getAll("kanas").join(" ")) : parseKanaSelection("あいうえお");
}

export function setKanaSelection(selection: KanaChars[], group: KanaChars[], checked: boolean): KanaChars[] {
  return checked ? [...new Set([...selection, ...group])] : selection.filter((kana) => !group.includes(kana));
}

export function kanaSelectionState(selection: KanaChars[], group: KanaChars[]) {
  const count = group.filter((kana) => selection.includes(kana)).length;
  return { checked: count === group.length, indeterminate: count > 0 && count < group.length };
}
