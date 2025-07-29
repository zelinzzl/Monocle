import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const CubeTransparent = (props: IconProps) => {
  const { color, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...rest}
    >
      <path
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m21 7.5-2.25-1.312M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.312M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.312M12 12.75l-2.25-1.312M12 12.75V15m0 6.75 2.25-1.312M12 21.75V19.5m0 2.25-2.25-1.312m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
      />
    </svg>
  );
};
export default CubeTransparent;
