import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const BookOpen = (props: IconProps) => {
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
        d="M12 6.042A8.97 8.97 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A9 9 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.97 8.97 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A9 9 0 0 0 18 18a8.97 8.97 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
};
export default BookOpen;
