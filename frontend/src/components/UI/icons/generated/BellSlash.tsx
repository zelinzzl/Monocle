import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const BellSlash = (props: IconProps) => {
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
        d="M9.143 17.082a24 24 0 0 0 3.844.148m-3.844-.148a24 24 0 0 1-5.455-1.31 8.96 8.96 0 0 0 2.3-5.542m3.155 6.852Q9.002 17.518 9 18a3 3 0 0 0 5.81 1.053m1.965-2.278L21 21m-4.225-4.225a24 24 0 0 0 3.536-1.003A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
      />
    </svg>
  );
};
export default BellSlash;
