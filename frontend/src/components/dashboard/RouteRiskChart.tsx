"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
interface RouteRiskData {
  critical: number;
  high: number;
  medium: number;
  good: number;
}
interface RouteRiskChartProps {
  data: RouteRiskData;
}
const RouteRiskChart: React.FC<RouteRiskChartProps> = ({
  data
}) => {
  const chartData = [{
    name: 'Critical Risk',
    value: data.critical,
    color: '#EF4444'
  }, {
    name: 'High Risk',
    value: data.high,
    color: '#F59E0B'
  }, {
    name: 'Medium Risk',
    value: data.medium,
    color: '#FBBF24'
  }, {
    name: 'Good Conditions',
    value: data.good,
    color: '#10B981'
  } // green-500
  ];
  return <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={value => [`${value} routes`, '']} contentStyle={{
          borderRadius: '0.375rem',
          border: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }} />
          <Legend layout="vertical" verticalAlign="middle" align="right" formatter={value => <span className="text-sm text-primary">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>;
};
export default RouteRiskChart;