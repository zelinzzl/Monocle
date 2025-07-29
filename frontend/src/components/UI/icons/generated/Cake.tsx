import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const Cake = (props: IconProps) => {
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
        d="M12 8.25v-1.5m0 1.5q-2.033 0-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871q2.033 0 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.35 3.35 0 0 1-3 0 3.35 3.35 0 0 0-3 0 3.35 3.35 0 0 1-3 0 3.35 3.35 0 0 0-3 0 3.35 3.35 0 0 1-3 0L3 16.5m15-3.379a48.5 48.5 0 0 0-6-.371q-3.05.002-6 .371m12 0q.585.073 1.163.16c1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A48 48 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845zm-3 0a.375.375 0 1 1-.53 0L9 2.845zm6 0a.375.375 0 1 1-.53 0L15 2.845z"
      />
    </svg>
  );
};
export default Cake;
