import { startCamera } from "./camera.js";
import { render } from "./render.js";
import { advanceToNextEmptySlot, captures, cells, setActiveSlot, state } from "./state.js";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function initSlots() {
  cells().forEach((cell, index) => {
    const input = cell.querySelector(".image-input");
    const uploadBtn = cell.querySelector(".upload-btn");

    cell.addEventListener("click", (e) => {
      if (e.target.closest(".upload-btn") || state.countingDown) return;
      setActiveSlot(index);
      render();
      if (!state.stream) startCamera();
    });

    uploadBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setActiveSlot(index);
      render();
      input.click();
    });

    input.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      input.value = "";
      captures[index] = await readFileAsDataUrl(file);
      advanceToNextEmptySlot();
      render();
    });
  });
}
