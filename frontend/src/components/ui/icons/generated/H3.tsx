import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const H3 = (props: IconProps) => {
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
        d="M20.906 14.626a4.52 4.52 0 0 1 .738 3.603c-.155.695-.795 1.143-1.505 1.208a15.2 15.2 0 0 1-3.639-.104m4.406-4.707a4.52 4.52 0 0 0 .738-3.603c-.155-.696-.795-1.144-1.505-1.209a15.2 15.2 0 0 0-3.639.104m4.406 4.708H18M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501"
      />
    </svg>
  );
};
export default H3;
