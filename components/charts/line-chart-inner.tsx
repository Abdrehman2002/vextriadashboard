'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface CallsLineChartProps {
  data: { date: string; calls: number }[]
}

export default function CallsLineChartInner({ data }: CallsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="date" stroke="#2A2A2A" />
        <YAxis stroke="#2A2A2A" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="calls" stroke="#000000" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
