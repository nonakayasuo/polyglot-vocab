"use client";

import { useEffect, type MouseEvent, type TouchEvent } from "react";
import { cn } from "@/lib/utils";

interface OverlayProps {
  /** オーバーレイがクリックされた時のコールバック */
  onClose: () => void;
  /** 背景の透明度クラス */
  className?: string;
}

/**
 * アクセシブルな背景オーバーレイコンポーネント
 * モーダル、ポップオーバー、ドロップダウンなどの背景として使用
 *
 * - クリックまたはEscapeキーで閉じる
 * - モバイルタッチ対応
 */
function Overlay({ onClose, className }: OverlayProps) {
  // Escapeキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // タッチ終了時に閉じる（モバイル対応）
  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 少し遅延させて確実に閉じる
    setTimeout(onClose, 50);
  };

  // クリックで閉じる（デスクトップ対応）
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      data-slot="overlay"
      className={cn(
        "fixed inset-0 z-40 bg-black/20",
        "touch-none", // タッチイベントのスクロールを防止
        className,
      )}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      role="presentation"
      aria-hidden="true"
    />
  );
}

export { Overlay };
export type { OverlayProps };
