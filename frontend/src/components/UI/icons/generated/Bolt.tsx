import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const Bolt = (props: IconProps) => {
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
        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5z"
      />
    </svg>
  );
};
export default Bolt;
