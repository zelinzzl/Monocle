"use client";

import React from 'react';
interface RiskSummaryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}
const RiskSummaryCard: React.FC<RiskSummaryCardProps> = ({
  title,
  count,
  icon,
  color,
  description
}) => {
  return <div className="bg-background rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-dark">{title}</h3>
        <div className={`p-2 rounded-full ${color.split(' ')[0]}`}>{icon}</div>
      </div>
      <div className="flex items-end space-x-1">
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-xs text-muted-foreground mb-1">routes</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>;
};
export default RiskSummaryCard;