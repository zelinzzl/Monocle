import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const PercentBadge = (props: IconProps) => {
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
        d="m8.99 14.993 6-6m6 3.001c0 1.268-.63 2.39-1.593 3.069a3.75 3.75 0 0 1-1.043 3.296 3.75 3.75 0 0 1-3.296 1.043 3.75 3.75 0 0 1-3.068 1.593c-1.268 0-2.39-.63-3.068-1.593a3.75 3.75 0 0 1-3.296-1.043 3.75 3.75 0 0 1-1.043-3.297 3.75 3.75 0 0 1-1.593-3.068c0-1.268.63-2.39 1.593-3.068a3.75 3.75 0 0 1 1.043-3.297 3.75 3.75 0 0 1 3.296-1.042 3.75 3.75 0 0 1 3.068-1.594c1.268 0 2.39.63 3.068 1.593a3.75 3.75 0 0 1 3.296 1.043 3.75 3.75 0 0 1 1.043 3.297 3.75 3.75 0 0 1 1.593 3.068M9.74 9.743h.008v.007H9.74zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0m4.125 4.5h.008v.008h-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0"
      />
    </svg>
  );
};
export default PercentBadge;
