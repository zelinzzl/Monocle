import React, { JSX } from "react";
import { motion, MotionProps } from "framer-motion";
import { AnimationPreset, animationPresets } from "./animationPresets";
import { useAnimation } from "./useAnimation";
import { useMemo } from "react";

interface AnimateProps extends MotionProps {
  children: React.ReactNode;
  type?: keyof typeof animationPresets;
  delay?: number;
  duration?: number;
  customProps?: AnimationPreset;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: unknown;
}

function Animate({
  children,
  type = "fade",
  delay = 0,
  duration,
  customProps,
  as = "div",
  ...props
}: AnimateProps) {
  const { animationProps } = useAnimation(type, delay, duration, customProps);
  // const MotionComponent = motion(as);
    const MotionComponent = useMemo(() => motion(as), [as]);

  return (
    <MotionComponent {...animationProps} {...props}>
      {children}
    </MotionComponent>
  );
}

export default Animate;

