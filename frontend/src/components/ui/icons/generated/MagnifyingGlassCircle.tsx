import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const MagnifyingGlassCircle = (props: IconProps) => {
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
        d="m15.75 15.75-2.488-2.488m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.772 4.772M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
      />
    </svg>
  );
};
export default MagnifyingGlassCircle;
