import { els, state } from "./state.js";

const TICK_MS = 1000;
const MAX_SECONDS = 60;
const STORAGE_KEY = "boothCountdownSeconds";

function clampSeconds(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_SECONDS);
}

export function initTimerPicker() {
  const presets = [...document.querySelectorAll(".timer-preset")];
  const custom = document.getElementById("timerCustom");

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) state.countdownSeconds = clampSeconds(saved);

  function renderPicker() {
    const current = state.countdownSeconds;
    let presetMatched = false;

    presets.forEach((btn) => {
      const on = Number(btn.dataset.seconds) === current;
      if (on) presetMatched = true;
      btn.classList.toggle("bg-primary", on);
      btn.classList.toggle("text-white", on);
      btn.classList.toggle("text-on-surface-variant", !on);
    });

    // Custom value: show it in the input and highlight the input
    const isCustom = !presetMatched;
    custom.value = isCustom ? String(current) : "";
    custom.classList.toggle("bg-primary", isCustom);
    custom.classList.toggle("text-white", isCustom);
    custom.classList.toggle("bg-surface-container-low", !isCustom);

    els.shutterBtn.title =
      current > 0 ? `Capture in ${current}s` : "Capture now";
  }

  function setSeconds(value) {
    state.countdownSeconds = clampSeconds(value);
    localStorage.setItem(STORAGE_KEY, String(state.countdownSeconds));
    renderPicker();
  }

  presets.forEach((btn) => {
    btn.addEventListener("click", () => setSeconds(btn.dataset.seconds));
  });

  // Apply when the user finishes typing (Enter or leaving the field)
  custom.addEventListener("change", () => {
    if (custom.value === "") return renderPicker();
    setSeconds(custom.value);
  });

  renderPicker();
}

export function runCountdown(onDone) {
  if (state.countingDown) return;

  const seconds = state.countdownSeconds;

  // No countdown: capture immediately
  if (seconds <= 0) {
    onDone();
    return;
  }

  const { countdownOverlay, countdownNumber, shutterBtn } = els;
  state.countingDown = true;
  shutterBtn.disabled = true;

  let n = seconds;
  countdownOverlay.classList.remove("hidden");
  countdownNumber.textContent = String(n);

  const id = setInterval(() => {
    n -= 1;
    if (n > 0) {
      countdownNumber.textContent = String(n);
      return;
    }
    clearInterval(id);
    countdownOverlay.classList.add("hidden");
    state.countingDown = false;
    shutterBtn.disabled = false;
    onDone();
  }, TICK_MS);
}