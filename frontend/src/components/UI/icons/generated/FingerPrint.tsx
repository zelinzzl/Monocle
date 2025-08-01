import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const FingerPrint = (props: IconProps) => {
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
        d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.269M5.742 6.364A7.47 7.47 0 0 0 4.5 10.5a7.46 7.46 0 0 1-1.15 3.993m1.989 3.559A11.2 11.2 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0q0 .79-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.7 18.7 0 0 1-2.485 5.33"
      />
    </svg>
  );
};
export default FingerPrint;
