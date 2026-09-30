import { captureFrame, startCamera, stopStream, switchCamera } from "./booth/camera.js";
import { initModals } from "./booth/modals.js";
import { render } from "./booth/render.js";
import { initShare } from "./booth/share.js";
import { initSlots } from "./booth/slots.js";
import { advanceToNextEmptySlot, captures, config, els, state } from "./booth/state.js";
import { initTimerPicker, runCountdown } from "./booth/timer.js";

function initControls() {
  els.shutterBtn.addEventListener("click", async () => {
    if (!state.stream) await startCamera();
    if (!state.stream) return;
    captures[state.activeSlotIndex] = null;
    render();
    runCountdown(() => {
      captureFrame();
      advanceToNextEmptySlot();
      render();
    });
  });

  els.resetBtn.addEventListener("click", () => {
    stopStream();
    captures.fill(null);
    state.cameraError = false;
    state.activeSlotIndex = 0;
    render();
  });

  els.switchCameraBtn.addEventListener("click", switchCamera);

  els.layoutSelect.addEventListener("change", (e) => {
    window.location.search = "?layout=" + encodeURIComponent(e.target.value);
  });

  els.gridHintBtn.addEventListener("click", () => {
    alert(`Layout: ${config.layoutTitle} — ${config.slotCount} photo(s). Tap a slot, then the shutter.`);
  });
}

initSlots();
initControls();
initModals();
initShare();
initTimerPicker();
render();
