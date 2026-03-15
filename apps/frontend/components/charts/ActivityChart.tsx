"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const generateMockData = () => {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return days.map((day) => ({
    day,
    completed: Math.floor(Math.random() * 12) + 1,
    created: Math.floor(Math.random() * 8) + 1,
  }));
};

const data = generateMockData();

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Complétées"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#colorCompleted)"
        />
        <Area
          type="monotone"
          dataKey="created"
          name="Créées"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorCreated)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
