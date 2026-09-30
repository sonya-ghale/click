import { allSlotsFilled, captures, config, els } from "./state.js";

function clipRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draws the layout at exactly targetW × targetH; every photo fills (crops to) its cell
export async function buildCompositeBlob(targetW, targetH) {
  if (!allSlotsFilled()) throw new Error("incomplete");
  const imgs = await Promise.all(captures.map(loadImage));
  const { pad, gap, cols, rows } = config;
  const cellW = (targetW - pad * 2 - gap * (cols - 1)) / cols;
  const cellH = (targetH - pad * 2 - gap * (rows - 1)) / rows;

  const canvas = els.compositeCanvas;
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fcf6b9";
  ctx.fillRect(0, 0, targetW, targetH);

  imgs.forEach((img, i) => {
    const x = pad + (i % cols) * (cellW + gap);
    const y = pad + Math.floor(i / cols) * (cellH + gap);
    const scale = Math.max(cellW / img.width, cellH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.save();
    clipRoundRect(ctx, x, y, cellW, cellH, 8);
    ctx.drawImage(img, x + (cellW - dw) / 2, y + (cellH - dh) / 2, dw, dh);
    ctx.restore();
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

export function buildCompositeForButton(btn) {
  return buildCompositeBlob(parseInt(btn.dataset.width, 10), parseInt(btn.dataset.height, 10));
}

export function saveBlob(blob, sizeKey) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scrapbook-" + config.layoutKey + "-" + sizeKey + "-" + new Date().toISOString().slice(0, 10) + ".jpg";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
