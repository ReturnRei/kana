import React from "react";
import { Container } from "@mantine/core";
import IntroductionCard from "./components/IntroductionCard";
import PracticeCard from "./components/PracticeCard";
import PracticeKanaInput from "./components/PracticeKanaInput";
import ExplanationCard from "./components/ExplanationCard";

document.onkeydown = (event) => {
  // Refocusing mid-composition risks discarding what the IME is holding
  if (event.isComposing) return;

  if (event.key.length > 1 && ["Backspace", "Enter"].every((allowedKey) => event.code !== allowedKey)) return;

  // Let Enter/Space activate focused controls, including individual kana toggles.
  if (
    ["Enter", " "].includes(event.key) &&
    event.target instanceof Element &&
    event.target.closest("button, input, a, select, textarea")
  )
    return;

  const kanaInput = document.getElementById(PracticeKanaInput.kanaInputId);
  if (kanaInput) kanaInput.focus();
};

function App() {
  return (
    <Container>
      <IntroductionCard />
      <PracticeCard />
      <ExplanationCard />
    </Container>
  );
}

export default App;
