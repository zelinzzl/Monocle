"use client";
import React, { useEffect, useRef } from "react";
import * as Icons from "./index";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      destructive: "text-destructive",
      accent: "text-accent-foreground",
    },
    size: {
      default: "size-6",
      sm: "size-4",
      md: "size-5",
      lg: "size-7",
      xl: "size-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface IconProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof iconVariants> {
  name: IconName;
  className?: string;
  isLottie?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  animateOnHover?: boolean;
  forcePlay?: boolean;
}

export type IconConfig = Omit<IconProps, "name"> & {
  name?: IconName;
};

export function Icon({
  name,
  variant,
  size,
  className,
  isLottie = false,
  loop = true,
  autoplay = true,
  animateOnHover = false,
  forcePlay = false,
  ...props
}: IconProps) {
  const iconKey = name as keyof typeof Icons.iconComponents;
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (!isLottie || !lottieRef.current) return;

    if (forcePlay) {
      lottieRef.current.play();
    } else {
      lottieRef.current.stop();
    }
  }, [forcePlay, isLottie]);

  if (isLottie) {
    const lottieKey = name as keyof typeof Icons.lottieComponents;
    const LottieComponent = Icons.lottieComponents[lottieKey];

    if (!LottieComponent) {
      console.warn(
        `Lottie animation "${name}" not found. Available animations:`,
        Object.keys(Icons.lottieComponents)
      );
      return (
        <div
          className={cn(
            iconVariants({ size, className }),
            "bg-destructive/10 border border-dashed border-destructive"
          )}
        />
      );
    }

    return (
      <div
        id="lottie-container"
        className={cn(iconVariants({ size, className }), "inline-block")}
        onMouseEnter={() => {
          if (animateOnHover && lottieRef.current && !forcePlay) {
            lottieRef.current.play();
          }
        }}
        onMouseLeave={() => {
          if (animateOnHover && lottieRef.current && !forcePlay) {
            lottieRef.current.stop();
          }
        }}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={LottieComponent}
          loop={loop}
          autoplay={!animateOnHover && autoplay && !forcePlay}
          className="w-full h-full"
        />
      </div>
    );
  }

  const IconComponent = Icons.iconComponents[iconKey] as
    | React.ComponentType<React.SVGProps<SVGSVGElement>>
    | undefined;

  if (!IconComponent) {
    console.warn(
      `Icon "${name}" not found. Available icons:`,
      Object.keys(Icons.iconComponents)
    );
    return (
      <div
        className={cn(
          iconVariants({ size, className }),
          "bg-destructive/10 border border-dashed border-destructive"
        )}
      />
    );
  }

  return (
    <IconComponent
      className={cn(iconVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export type IconName =
  | keyof typeof Icons.iconComponents
  | keyof typeof Icons.lottieComponents;

export const getDefaultIconProps = (): IconConfig => ({
  variant: "default",
  size: "default",
  className: undefined,
  isLottie: false,
  loop: true,
  autoplay: true,
  animateOnHover: false,
});
