import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const DocumentCurrencyPound = (props: IconProps) => {
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
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.621 9.879a3 3 0 0 0-5.02 2.897l.164.609a4.5 4.5 0 0 1-.108 2.676l-.157.439.44-.22a2.86 2.86 0 0 1 2.185-.155c.72.24 1.507.184 2.186-.155L15 18M8.25 15.75H12m-1.5-13.5H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9"
      />
    </svg>
  );
};
export default DocumentCurrencyPound;
