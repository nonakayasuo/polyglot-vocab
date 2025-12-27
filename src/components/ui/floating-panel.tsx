"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { cn } from "@/lib/utils";

interface FloatingPanelProps {
  /** X座標（px） */
  x: number;
  /** Y座標（px） */
  y: number;
  /** 最小幅 */
  minWidth?: number;
  /** 最大幅 */
  maxWidth?: number;
  /** ビューポート端からのマージン（px） */
  viewportMargin?: number;
  /** パネルの水平位置揃え */
  align?: "left" | "center" | "right";
  /** パネルの内容 */
  children: ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 位置指定されたフローティングパネルコンポーネント
 * ポップオーバー、ツールチップ、コンテキストメニューなどに使用
 *
 * - ビューポート内に収まるよう自動調整
 * - クリック/タッチイベントの伝播を防止
 */
function FloatingPanel({
  x,
  y,
  minWidth = 280,
  maxWidth = 360,
  viewportMargin = 16,
  align = "center",
  className,
  children,
}: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });
  const [isVisible, setIsVisible] = useState(false);

  // マウント後に位置を計算
  useEffect(() => {
    const calculatePosition = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const panelHeight = panelRef.current?.offsetHeight || 300;

      // X座標の調整
      let adjustedX = x;
      if (align === "center") {
        const halfWidth = maxWidth / 2;
        adjustedX = Math.max(
          viewportMargin + halfWidth,
          Math.min(x, vw - halfWidth - viewportMargin)
        );
      }

      // Y座標の調整（画面外に出ないように）
      let adjustedY = y;
      const maxY = scrollY + vh - panelHeight - viewportMargin;
      if (y > maxY) {
        // 下に余裕がない場合、上に表示
        adjustedY = Math.max(scrollY + viewportMargin, y - panelHeight - 50);
      }

      setPosition({ left: adjustedX, top: adjustedY });
      setIsVisible(true);
    };

    // 次のフレームで計算（レイアウト完了後）
    requestAnimationFrame(calculatePosition);
  }, [x, y, maxWidth, viewportMargin, align]);

  const getTransform = () => {
    switch (align) {
      case "left":
        return "translateX(0)";
      case "right":
        return "translateX(-100%)";
      default:
        return "translateX(-50%)";
    }
  };

  // イベント伝播を防止
  const stopPropagation = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={panelRef}
      data-slot="floating-panel"
      role="dialog"
      aria-modal="false"
      className={cn(
        "fixed z-50",
        "bg-white dark:bg-slate-800",
        "rounded-xl shadow-2xl",
        "border border-gray-200 dark:border-slate-700",
        "p-4",
        "transition-opacity duration-150",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
        transform: getTransform(),
      }}
      onClick={stopPropagation}
      onTouchEnd={stopPropagation}
      onTouchStart={stopPropagation}
    >
      {children}
    </div>
  );
}

export { FloatingPanel };
export type { FloatingPanelProps };
