import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const ArrowUpLeft = (props: IconProps) => {
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
        d="m19.5 19.5-15-15m0 0v11.25m0-11.25h11.25"
      />
    </svg>
  );
};
export default ArrowUpLeft;
