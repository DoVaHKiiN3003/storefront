"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right";

interface AnimateOnViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  rootMargin?: string;
}

const directionClasses: Record<Direction, string> = {
  up: "translate-y-6",
  down: "-translate-y-6",
  left: "translate-x-8",
  right: "-translate-x-8",
};

/**
 * Shared hook that triggers once when an element enters the viewport.
 */
export function useOnView(
  ref: React.RefObject<Element | null>,
  rootMargin = "-50px"
) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, rootMargin]);

  return visible;
}

/**
 * Shared component that animates its children when they scroll into view.
 * Wraps children in a div that fades and slides in on intersection.
 */
export default function AnimateOnView({
  children,
  className = "",
  delay = 0,
  duration = 600,
  direction = "up",
  rootMargin = "-50px",
}: AnimateOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useOnView(ref, rootMargin);

  const animClass = `transition-all ease-[cubic-bezier(0.32,0.72,0,1)] ${
    visible
      ? "opacity-100 translate-y-0 translate-x-0"
      : `opacity-0 ${directionClasses[direction]}`
  } ${className}`;

  const style: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div ref={ref} className={animClass} style={style}>
      {children}
    </div>
  );
}
