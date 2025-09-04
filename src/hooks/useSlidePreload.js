// src/hooks/useSlidePreload.js
import { useState } from "react";

/**
 * 預載＋滑動轉場控制：
 * - currentIdx / nextIdx：目前與下一張索引
 * - direction：1 下一張；-1 上一張；0 靜止
 * - animating：是否正在轉場
 * - go(delta)：先預載目標圖，載好後才觸發轉場
 * - finish()：由外層在 onTransitionEnd 呼叫，完成狀態切換
 */
export default function useSlidePreload(images = [], initialIdx = 0) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [nextIdx, setNextIdx] = useState(null);
  const [direction, setDirection] = useState(0);

  const currentSrc = images[currentIdx] || null;
  const nextSrc = nextIdx != null ? images[nextIdx] : null;
  const animating = nextIdx != null;

  const preload = (url) =>
    new Promise((resolve) => {
      if (!url) return resolve();
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => resolve();
      img.src = url;
    });

  const go = async (delta = 1) => {
    if (!images?.length || animating) return;
    const len = images.length;
    const targetIdx = ((currentIdx + delta) % len + len) % len;
    const targetSrc = images[targetIdx];
    // 先預載
    await preload(targetSrc);
    setDirection(delta > 0 ? 1 : -1);
    setNextIdx(targetIdx);
  };

  const finish = () => {
    if (nextIdx != null) {
      setCurrentIdx(nextIdx);
      setNextIdx(null);
      setDirection(0);
    }
  };

  return { currentIdx, currentSrc, nextIdx, nextSrc, direction, animating, go, finish };
}