import { render } from "./render.js";
import { captures, els, state } from "./state.js";

export function stopStream() {
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }
  els.boothVideo.srcObject = null;
}

export async function startCamera() {
  stopStream();
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: state.facingMode },
      audio: false,
    });
    state.cameraError = false;
    els.boothVideo.srcObject = state.stream;
    els.boothVideo.classList.toggle("mirrored", state.facingMode === "user");
  } catch (e) {
    state.stream = null;
    state.cameraError = true;
  }
  render();
}

export async function switchCamera() {
  state.facingMode = state.facingMode === "user" ? "environment" : "user";
  if (state.stream) await startCamera();
}

export function captureFrame() {
  const { boothVideo, captureCanvas } = els;
  if (!boothVideo.videoWidth || !state.stream) return false;
  captureCanvas.width = boothVideo.videoWidth;
  captureCanvas.height = boothVideo.videoHeight;
  const ctx = captureCanvas.getContext("2d");
  ctx.save();
  if (state.facingMode === "user") {
    ctx.translate(captureCanvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(boothVideo, 0, 0);
  ctx.restore();
  captures[state.activeSlotIndex] = captureCanvas.toDataURL("image/jpeg", 0.92);
  return true;
}
