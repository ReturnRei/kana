# Kana

## Free Mode selections

Click a kana tile to select or deselect it. Column and category checkboxes select
whole groups; individual tiles can then override that selection. A partially
selected group shows a mixed checkbox. Clearing all kana pauses practice.

Add `kanas` to a URL to open Free Mode with only those kana selected:

- `/kana/?kanas=らリ` selects hiragana ら and katakana リ.
- `/kana/?kanas=きゃシュ` selects the two compounds きゃ and シュ, not their base kana.
- `/kana/?kanas=` starts with nothing selected.

Both literal kana and percent-encoded URLs work. Compounds are matched before
single kana. Spaces or commas can separate items; duplicates and unsupported
characters are ignored. Only kana represented on the board are supported.
Without the parameter, the menu and Free Mode's default vowels are unchanged.

## Local checks

Run `npm ci`, then `npm test`, `npm run lint`, and `npm run build`.
The tests cover mixed scripts, every supported compound, URL encoding,
normalization, empty selections, and individual overrides of group selections.
