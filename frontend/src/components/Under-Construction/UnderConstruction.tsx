import React from "react";
import { Icon } from "@/components/UI/icons/Icon";

interface DevOnlyNoticeProps {
  text: string;
}

const DevOnlyNotice: React.FC<DevOnlyNoticeProps> = ({ text }) => {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="flex items-center gap-2 text-yellow-600 p-2 rounded-md">
      <Icon name="WrenchScrewdriver" size="lg" className="text-yellow-600" />
      <span>{text}</span>
    </div>
  );
};

export default DevOnlyNotice;
