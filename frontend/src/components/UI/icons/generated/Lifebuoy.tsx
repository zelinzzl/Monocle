import React from "react";
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}
const Lifebuoy = (props: IconProps) => {
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
        d="M16.712 4.33a9 9 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.01 9.01 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.01 9.01 0 0 1 0 9.424m-4.138-5.976a3.7 3.7 0 0 0-.88-1.388 3.7 3.7 0 0 0-1.388-.88m2.268 2.268a3.77 3.77 0 0 1 0 2.528m-2.268-4.796a3.77 3.77 0 0 0-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.7 3.7 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9 9 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.01 9.01 0 0 1-9.424 0m5.976-4.138a3.77 3.77 0 0 1-2.528 0m0 0a3.7 3.7 0 0 1-1.388-.88 3.7 3.7 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9 9 0 0 1-1.652-1.306 9 9 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.01 9.01 0 0 1 0-9.424m4.138 5.976a3.77 3.77 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.7 3.7 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9 9 0 0 0-1.652 1.306A9 9 0 0 0 4.33 7.288"
      />
    </svg>
  );
};
export default Lifebuoy;
