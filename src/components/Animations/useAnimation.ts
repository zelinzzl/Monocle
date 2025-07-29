import { animationPresets, AnimationPreset } from "./animationPresets";

export const useAnimation = (
  type: string,
  delay?: number,
  duration?: number,
  customProps?: AnimationPreset
) => {
  const animation =
    customProps || animationPresets[type] || animationPresets.fade;

  return {
    animationProps: {
      ...animation,
      transition: {
        ...(animation.transition || {}),
        ...(delay !== undefined && { delay }),
        ...(duration !== undefined && { duration }),
      },
    },
  };
};
