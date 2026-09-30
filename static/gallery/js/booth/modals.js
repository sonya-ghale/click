import { buildCompositeForButton, saveBlob } from "./composite.js";
import { allSlotsFilled, els } from "./state.js";

const sizeModal = document.getElementById("sizeModal");
const previewModal = document.getElementById("previewModal");
const previewImage = document.getElementById("previewImage");
const previewLoading = document.getElementById("previewLoading");
const previewSizes = [...document.querySelectorAll(".preview-size")];

let previewBlob = null;
let previewUrl = null;
let previewSize = previewSizes[0];
let previewRequest = 0;

function closeOnBackdrop(modal, close) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
}

function openSizeModal() {
  if (allSlotsFilled()) sizeModal.classList.remove("hidden");
}

function closeSizeModal() {
  sizeModal.classList.add("hidden");
}

function highlightPreviewSize(btn) {
  previewSizes.forEach((b) => {
    const on = b === btn;
    b.classList.toggle("border-primary", on);
    b.classList.toggle("bg-primary", on);
    b.classList.toggle("text-white", on);
    b.classList.toggle("text-on-surface-variant", !on);
  });
}

async function renderPreview(btn) {
  previewSize = btn;
  highlightPreviewSize(btn);
  const request = ++previewRequest;
  previewBlob = null;
  previewImage.classList.add("hidden");
  previewLoading.textContent = "Rendering…";
  previewLoading.classList.remove("hidden");
  try {
    const blob = await buildCompositeForButton(btn);
    if (request !== previewRequest) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewBlob = blob;
    previewUrl = URL.createObjectURL(blob);
    previewImage.src = previewUrl;
    previewImage.classList.remove("hidden");
    previewLoading.classList.add("hidden");
  } catch (err) {
    console.error(err);
    previewLoading.textContent = "Couldn't render the preview.";
  }
}

function openPreview() {
  if (!allSlotsFilled()) return;
  previewModal.classList.remove("hidden");
  renderPreview(previewSize);
}

function closePreview() {
  previewModal.classList.add("hidden");
}

function initSizeModal() {
  els.downloadBtn.addEventListener("click", openSizeModal);
  document.getElementById("sizeModalClose").addEventListener("click", closeSizeModal);
  closeOnBackdrop(sizeModal, closeSizeModal);

  document.querySelectorAll(".size-option").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        saveBlob(await buildCompositeForButton(btn), btn.dataset.sizeKey);
        closeSizeModal();
      } catch (err) {
        console.error(err);
      }
    });
  });
}

function initPreviewModal() {
  els.previewBtn.addEventListener("click", openPreview);
  document.getElementById("previewClose").addEventListener("click", closePreview);
  document.getElementById("previewCancel").addEventListener("click", closePreview);
  closeOnBackdrop(previewModal, closePreview);
  previewSizes.forEach((btn) => btn.addEventListener("click", () => renderPreview(btn)));
  document.getElementById("previewDownload").addEventListener("click", () => {
    if (!previewBlob) return;
    saveBlob(previewBlob, previewSize.dataset.sizeKey);
    closePreview();
  });
}

export function initModals() {
  initSizeModal();
  initPreviewModal();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSizeModal();
      closePreview();
    }
  });
}
