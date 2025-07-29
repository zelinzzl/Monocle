import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const Divide = (props: IconProps) => {
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
        d="M4.499 11.998h15m-7.5-6.75h.008v.008h-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0M12 18.751h.007v.007H12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0"
      />
    </svg>
  );
};
export default Divide;
