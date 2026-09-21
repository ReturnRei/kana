import { Container, Group, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useRef, useState } from "react";
import { getDefaultRomaji, KanaChars, kanaMap, spacedRepetitionStream } from "../utilities/kana";
import { initialKanaSelection } from "../utilities/selection";
import { tooltipProps } from "../utilities/tooltip";
import FreePracticeOptions from "./FreePracticeOptions";
import KanaAnswerTooltipHint from "./KanaAnswerTooltipHint";
import PlayKanaSoundButton from "./PlayKanaSoundButton";
import { MiscPracticeOptions } from "./PracticeCard";
import PracticeKanaInput from "./PracticeKanaInput";
import PracticeOptions from "./PracticeOptions";

const buildSpacedRepetitionStream = (selection: KanaChars[]) =>
  selection.length ? spacedRepetitionStream(selection.map((kana) => ({ kana, romaji: kanaMap[kana] }))) : null;

function FreePractice() {
  const [openedOptions, { toggle: toggleOptions, open: openOptions }] = useDisclosure(true);

  const [stats, setStats] = useState({ correctCount: 0, totalCount: 0 });

  const [options, setOptions] = useState(() => initialKanaSelection(window.location.search));
  const [miscOptions, setMiscOptions] = useState<MiscPracticeOptions>({ showCorrectAnswer: false });

  const streamRef = useRef(buildSpacedRepetitionStream(options));

  const [currentKana, setCurrentKana] = useState(streamRef.current?.current() ?? null);

  const onAnswer = (correct: boolean) => {
    if (!streamRef.current) return;
    setStats((prev) => ({
      correctCount: correct ? prev.correctCount + 1 : prev.correctCount,
      totalCount: prev.totalCount + 1,
    }));

    if (!correct) {
      streamRef.current.onFail();
    }
    streamRef.current.next();

    setCurrentKana(streamRef.current?.current() ?? null);
  };

  const handleOptionsChange = (newOptions: typeof options) => {
    setOptions(newOptions);
    if (!newOptions.length) openOptions();

    streamRef.current = buildSpacedRepetitionStream(newOptions);
    setCurrentKana(streamRef.current?.current() ?? null);
  };

  const handleMiscOptionsChange = (newOptions: typeof miscOptions) => {
    setMiscOptions(newOptions);
  };

  return (
    <Container px={0}>
      {currentKana ? (
        <PracticeKanaInput kana={currentKana} onAnswer={onAnswer} showCorrectAnswer={miscOptions.showCorrectAnswer} />
      ) : (
        <Text>Select one or more kana below to start practicing.</Text>
      )}

      <Group mt="md" position="apart" align="end">
        <Group>
          {currentKana && (
            <PlayKanaSoundButton key={getDefaultRomaji(currentKana.romaji)} romaji={currentKana.romaji} />
          )}
          <PracticeOptions.CollapseButton opened={openedOptions} onClick={toggleOptions} />
          <KanaAnswerTooltipHint />
        </Group>
        <Group>
          <Tooltip {...tooltipProps} label="Correct / Total">
            <Text c="dimmed" fz="sm">{`${stats.correctCount} / ${stats.totalCount}`}</Text>
          </Tooltip>
        </Group>
      </Group>

      <PracticeOptions opened={openedOptions}>
        <FreePracticeOptions
          options={options}
          miscOptions={miscOptions}
          onChange={handleOptionsChange}
          onMiscChange={handleMiscOptionsChange}
        />
      </PracticeOptions>
    </Container>
  );
}

export default FreePractice;
