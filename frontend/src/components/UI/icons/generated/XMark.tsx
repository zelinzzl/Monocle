import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const XMark = (props: IconProps) => {
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
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
};
export default XMark;
