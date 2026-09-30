import { captures, cells, config, els, state } from "./state.js";

const STATUS_BASE = "slot-status absolute top-3 right-3 z-10 font-mono text-[8px] font-bold uppercase tracking-widest";

function placeholderHtml(icon, text) {
  return `
    <div class="w-full h-full flex flex-col items-center justify-center gap-2 text-white/40">
      <span class="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
        <span class="material-symbols-outlined text-lg">${icon}</span>
      </span>
      <span class="font-label text-[10px]">${text}</span>
    </div>`;
}

function renderSlot(cell, i) {
  const { boothVideo } = els;
  const slot = cell.querySelector(".frame-slot");
  const status = cell.querySelector(".slot-status");
  const rec = cell.querySelector(".slot-rec");
  const active = i === state.activeSlotIndex;
  const live = active && state.stream && !captures[i];

  cell.classList.toggle("slot-active", active);
  cell.classList.toggle("slot-filled", !!captures[i]);
  rec.classList.toggle("hidden", !live);

  if (captures[i]) {
    slot.innerHTML = `<img src="${captures[i]}" alt="Capture ${i + 1}" />`;
    status.textContent = "Captured";
    status.className = `${STATUS_BASE} text-secondary-fixed-dim`;
  } else if (live) {
    slot.innerHTML = "";
    slot.appendChild(boothVideo);
    boothVideo.play().catch(() => {});
    status.textContent = "Live feed";
    status.className = `${STATUS_BASE} text-emerald-400`;
  } else {
    let icon = "photo_camera";
    let text = "Awaiting capture";
    if (active && state.cameraError) {
      icon = "no_photography";
      text = "Camera unavailable — upload instead";
    } else if (active) {
      text = "Tap shutter to start";
    }
    slot.innerHTML = placeholderHtml(icon, text);
    status.textContent = "Ready";
    status.className = `${STATUS_BASE} text-white/40`;
  }
}

function renderStatusBar() {
  const live = !!state.stream;
  els.camStatus.textContent = live ? "Cam 01 Ready" : "Cam 01 Off";
  els.camDot.className = "w-1.5 h-1.5 rounded-full " + (live ? "bg-emerald-500" : "bg-outline-variant");
  els.slotStatus.textContent = `Slot ${state.activeSlotIndex + 1} / ${config.slotCount} Active`;
  els.liveText.textContent = live ? "Live" : "Idle";
  els.liveDot.className = "w-1.5 h-1.5 rounded-full " + (live ? "bg-emerald-400" : "bg-white/30");
  els.liveChip.classList.toggle("text-emerald-400", live);
  els.liveChip.classList.toggle("text-white/40", !live);
}

function renderActions() {
  const filled = captures.filter(Boolean).length;
  const incomplete = filled < config.slotCount;
  els.downloadBtn.disabled = incomplete;
  els.previewBtn.disabled = incomplete;
  els.downloadLabel.textContent = incomplete ? `Download · ${filled}/${config.slotCount}` : "Download";
}

export function render() {
  els.videoParking.appendChild(els.boothVideo);
  cells().forEach(renderSlot);
  renderStatusBar();
  renderActions();
}
