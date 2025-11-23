'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Import recharts as a whole module to avoid type issues
const Chart = dynamic(
  () => import('./line-chart-inner'),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[300px]" />
  }
)

interface CallsLineChartProps {
  data: { date: string; calls: number }[]
}

export default function CallsLineChart({ data }: CallsLineChartProps) {
  return <Chart data={data} />
}
