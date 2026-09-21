import React from "react";
import KanaBoard from "./KanaBoard";
import { KanaChars } from "../utilities/kana";
import { MiscPracticeOptions } from "./PracticeCard";
import { Checkbox, Container, Title } from "@mantine/core";

export interface FreePracticeOptionsProps {
  options: KanaChars[];
  miscOptions: MiscPracticeOptions;
  onChange: (options: KanaChars[]) => void;
  onMiscChange: (options: MiscPracticeOptions) => void;
}

function FreePracticeOptions({ options, miscOptions, onChange, onMiscChange }: FreePracticeOptionsProps) {
  return (
    <>
      <Container px={0} py="md">
        <Title order={6} mb="sm">
          General
        </Title>
        <Checkbox
          label="Show correct answer when a wrong answer is given"
          checked={miscOptions.showCorrectAnswer}
          onChange={() => {
            onMiscChange({
              ...miscOptions,
              showCorrectAnswer: !miscOptions.showCorrectAnswer,
            });
          }}
        />
      </Container>

      <Title order={6} mb="sm">
        Kana
      </Title>
      <KanaBoard kanaType="hiragana" selection={options} onChange={onChange} />
      <KanaBoard kanaType="hiragana" selection={options} onChange={onChange} combinations />
      <KanaBoard kanaType="katakana" selection={options} onChange={onChange} />
      <KanaBoard kanaType="katakana" selection={options} onChange={onChange} combinations />
    </>
  );
}

export default FreePracticeOptions;
