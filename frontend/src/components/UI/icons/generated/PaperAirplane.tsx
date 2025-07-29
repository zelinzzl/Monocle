import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const PaperAirplane = (props: IconProps) => {
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
        d="M6 12 3.269 3.125A59.8 59.8 0 0 1 21.486 12a59.8 59.8 0 0 1-18.217 8.875zm0 0h7.5"
      />
    </svg>
  );
};
export default PaperAirplane;
