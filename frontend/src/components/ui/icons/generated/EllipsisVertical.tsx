import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const EllipsisVertical = (props: IconProps) => {
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
        d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5M12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5M12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5"
      />
    </svg>
  );
};
export default EllipsisVertical;
