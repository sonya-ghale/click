export const root = document.getElementById("editorRoot");

export const config = {
  layoutKey: root.dataset.layoutKey || "strip-4",
  layoutTitle: root.dataset.layoutTitle || "",
  slotCount: parseInt(root.dataset.slotCount || "4", 10),
  pad: parseInt(root.dataset.pad, 10) || 0,
  gap: parseInt(root.dataset.gap, 10) || 0,
  cols: parseInt(root.dataset.cols, 10) || 1,
  rows: parseInt(root.dataset.rows, 10) || parseInt(root.dataset.slotCount || "4", 10),
};

export const els = {
  captureCanvas: document.getElementById("captureCanvas"),
  compositeCanvas: document.getElementById("compositeCanvas"),
  boothVideo: document.getElementById("boothVideo"),
  videoParking: document.getElementById("videoParking"),
  countdownOverlay: document.getElementById("countdownOverlay"),
  countdownNumber: document.getElementById("countdownNumber"),
  shutterBtn: document.getElementById("shutterBtn"),
  resetBtn: document.getElementById("resetBtn"),
  switchCameraBtn: document.getElementById("switchCameraBtn"),
  previewBtn: document.getElementById("previewBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  downloadLabel: document.getElementById("downloadLabel"),
  shareBtn: document.getElementById("shareBtn"),
  layoutSelect: document.getElementById("layoutSelect"),
  gridHintBtn: document.getElementById("gridHintBtn"),
  camStatus: document.getElementById("camStatus"),
  camDot: document.getElementById("camDot"),
  slotStatus: document.getElementById("slotStatus"),
  liveChip: document.getElementById("liveChip"),
  liveText: document.getElementById("liveText"),
  liveDot: document.getElementById("liveDot"),
};

export const cells = () => [...document.querySelectorAll(".frame-cell")];

export const captures = new Array(config.slotCount).fill(null);

export const state = {
  stream: null,
  cameraError: false,
  facingMode: "user",
  activeSlotIndex: 0,
  countingDown: false,
  countdownSeconds: 3,
};

export function allSlotsFilled() {
  return captures.every(Boolean);
}

export function nextEmptySlot() {
  const after = captures.findIndex((c, i) => i > state.activeSlotIndex && !c);
  return after >= 0 ? after : captures.findIndex((c) => !c);
}

export function setActiveSlot(i) {
  state.activeSlotIndex = Math.max(0, Math.min(i, config.slotCount - 1));
}

export function advanceToNextEmptySlot() {
  const next = nextEmptySlot();
  if (next >= 0) state.activeSlotIndex = next;
}
