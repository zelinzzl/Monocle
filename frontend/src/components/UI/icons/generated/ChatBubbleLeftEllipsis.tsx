import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const ChatBubbleLeftEllipsis = (props: IconProps) => {
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
        d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0m0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0m0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0m0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227q1.63.24 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48 48 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.4 48.4 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741z"
      />
    </svg>
  );
};
export default ChatBubbleLeftEllipsis;
