import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const Megaphone = (props: IconProps) => {
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
        d="M10.34 15.84q-1.033-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75q1.057 0 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a21 21 0 0 1-1.44-4.282m3.102.069a18 18 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.9 23.9 0 0 1 8.835 2.535M10.34 6.66a23.85 23.85 0 0 0 8.835-2.535m0 0A24 24 0 0 0 18.795 3m.38 1.125a24 24 0 0 1 1.014 5.395m-1.014 8.855q-.177.57-.38 1.125m.38-1.125a24 24 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73s-.316 1.317-.811 1.73m0-3.46a24 24 0 0 1 0 3.46"
      />
    </svg>
  );
};
export default Megaphone;
