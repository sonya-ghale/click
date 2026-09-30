import { buildCompositeBlob } from "./composite.js";
import { allSlotsFilled, config, els } from "./state.js";

async function share() {
  if (!allSlotsFilled()) {
    alert("Fill every slot first, then save or share.");
    return;
  }
  try {
    const blob = await buildCompositeBlob(1200, 1800);
    const file = new File([blob], "scrapbook-layout.jpg", { type: "image/jpeg" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: config.layoutTitle });
    } else {
      window.open(URL.createObjectURL(blob), "_blank");
    }
  } catch (e) {
    console.error(e);
  }
}

export function initShare() {
  els.shareBtn.addEventListener("click", share);
}
