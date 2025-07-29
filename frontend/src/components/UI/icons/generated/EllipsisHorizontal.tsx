import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const EllipsisHorizontal = (props: IconProps) => {
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
        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0"
      />
    </svg>
  );
};
export default EllipsisHorizontal;
