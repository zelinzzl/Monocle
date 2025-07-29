import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const ArrowPathRoundedSquare = (props: IconProps) => {
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
        d="M19.5 12q0-1.848-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 49 49 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7q-.025.33-.046.662M19.5 12l3-3m-3 3-3-3m-12 3q0 1.848.138 3.662a4.006 4.006 0 0 0 3.7 3.7 49 49 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7q.025-.33.046-.662M4.5 12l3 3m-3-3-3 3"
      />
    </svg>
  );
};
export default ArrowPathRoundedSquare;
