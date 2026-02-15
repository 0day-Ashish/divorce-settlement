import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  blur?: boolean;
  scale?: boolean;
}

export function ScrollReveal({
  children,
  width = "fit-content",
  className,
  delay = 0,
  direction = "up",
  distance = 30,
  duration = 0.8,
  blur = true,
  scale = false,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      case "none":
        return {};
      default:
        return { y: distance };
    }
  };

  return (
    <div ref={ref} style={{ width }} className={className}>
      <motion.div
        variants={{
          hidden: {
            opacity: 0,
            ...getDirectionOffset(),
            filter: blur ? "blur(10px)" : "none",
            scale: scale ? 0.95 : 1,
          },
          visible: {
            opacity: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        initial="hidden"
        animate={controls}
      >
        {children}
      </motion.div>
    </div>
  );
}
