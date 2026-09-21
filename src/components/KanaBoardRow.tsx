import { Checkbox, Container, Stack, Text, UnstyledButton } from "@mantine/core";
import React from "react";
import { KanaChars } from "../utilities/kana";

export interface KanaBoardRowProps {
  content: ({ kana: KanaChars; romaji: string | string[] } | null)[];
  checked: boolean;
  indeterminate?: boolean;
  selection?: KanaChars[];
  onToggleKana?: (kana: KanaChars) => void;
  onChange: (checked: boolean) => void;
}

function KanaBoardRow({ content, checked, indeterminate, selection, onToggleKana, onChange }: KanaBoardRowProps) {
  return (
    <Stack sx={{ gap: 0 }}>
      <Container p={0}>
        <Checkbox
          aria-label={`Select column ${content
            .filter(Boolean)
            .map((letter) => letter?.kana)
            .join(" ")}`}
          checked={checked}
          indeterminate={indeterminate}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
      </Container>
      {content.map((letter, i) => {
        const visibility = letter === null ? "hidden" : "visible";

        const kana = letter?.kana ?? ".";
        const romaji = letter?.romaji ?? ".";

        const romajiIsArray = Array.isArray(romaji);
        const mainRomaji = romajiIsArray ? romaji[0] : romaji;
        const alternativeRomaji = romajiIsArray ? romaji.slice(1).join(", ") : null;

        if (letter && selection) {
          const selected = selection.includes(letter.kana);
          return (
            <Stack key={letter.kana} mt={8} sx={{ textAlign: "center", gap: 0 }}>
              <UnstyledButton
                aria-label={letter.kana}
                aria-pressed={selected}
                onClick={() => onToggleKana?.(letter.kana)}
                title={alternativeRomaji ?? undefined}
                sx={(theme) => ({
                  textAlign: "center",
                  borderRadius: theme.radius.sm,
                  backgroundColor: selected ? theme.colors.blue[9] : "transparent",
                  boxShadow: selected ? `inset 0 0 0 1px ${theme.colors.blue[5]}` : "none",
                  "&:hover": { backgroundColor: theme.colors.dark[5] },
                })}
              >
                <Text size="1.5rem">{kana}</Text>
              </UnstyledButton>
              <Text>{mainRomaji}</Text>
            </Stack>
          );
        }

        return (
          <Stack
            key={i}
            sx={{ textAlign: "center", gap: 0 }}
            mt={8}
            title={romajiIsArray ? `Alternatives: ${alternativeRomaji}` : undefined}
          >
            <Text sx={{ visibility }} size="1.5rem">
              {kana}
            </Text>
            <Text sx={{ visibility }}>{mainRomaji}</Text>
          </Stack>
        );
      })}
    </Stack>
  );
}

export default KanaBoardRow;
