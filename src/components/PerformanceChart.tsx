'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import type { VideoWithLatestStat } from '@/types'
import { formatNumber, formatDateShort } from '@/lib/utils'

interface PerformanceChartProps {
  videos: VideoWithLatestStat[]
  platform?: 'tiktok' | 'instagram' | 'all'
  chartType?: 'bar' | 'line'
}

interface ChartData {
  name: string
  views: number
  likes: number
  comments: number
  shares: number
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl p-3 text-xs shadow-xl"
        style={{ background: '#1e1e1e', border: '1px solid #333', color: '#e0e0e0' }}
      >
        <p className="font-semibold mb-2" style={{ color: '#f0f0f0' }}>
          {label}
        </p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span style={{ color: '#a0a0a0' }}>{entry.name}:</span>
            <span className="font-semibold">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function PerformanceChart({
  videos,
  platform = 'all',
  chartType = 'bar',
}: PerformanceChartProps) {
  const accentColor =
    platform === 'tiktok' ? '#ff0050' : platform === 'instagram' ? '#c084fc' : '#06b6d4'

  // Build chart data: top 10 videos by views, showing their latest stats
  const data: ChartData[] = videos
    .filter((v) => v.latestStat !== null)
    .sort((a, b) => (b.latestStat?.views ?? 0) - (a.latestStat?.views ?? 0))
    .slice(0, 10)
    .map((v) => ({
      name:
        v.title.length > 18
          ? v.title.slice(0, 18) + '…'
          : v.title,
      views: v.latestStat?.views ?? 0,
      likes: v.latestStat?.likes ?? 0,
      comments: v.latestStat?.comments ?? 0,
      shares: v.latestStat?.shares ?? 0,
    }))
    .reverse()

  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col items-center justify-center"
        style={{ background: '#1a1a1a', border: '1px solid #242424', minHeight: 280 }}
      >
        <p className="text-sm" style={{ color: '#4a4a4a' }}>
          No data to display yet
        </p>
        <p className="text-xs mt-1" style={{ color: '#3a3a3a' }}>
          Add videos to see performance charts
        </p>
      </div>
    )
  }

  const commonAxisProps = {
    tick: { fill: '#5a5a5a', fontSize: 11 },
    axisLine: { stroke: '#242424' },
    tickLine: false,
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#1a1a1a', border: '1px solid #242424' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
          Performance Overview
        </h2>
        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#242424', color: '#7a7a7a' }}>
          Top {data.length} videos
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {chartType === 'bar' ? (
          <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barSize={12}>
            <CartesianGrid vertical={false} stroke="#1e1e1e" strokeDasharray="3 3" />
            <XAxis dataKey="name" {...commonAxisProps} interval={0} />
            <YAxis
              {...commonAxisProps}
              tickFormatter={(v) => formatNumber(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#7a7a7a', paddingTop: 12 }}
            />
            <Bar dataKey="views" fill={accentColor} radius={[3, 3, 0, 0]} opacity={0.9} />
            <Bar dataKey="likes" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.8} />
            <Bar dataKey="comments" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.8} />
            <Bar dataKey="shares" fill="#22c55e" radius={[3, 3, 0, 0]} opacity={0.8} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e1e1e" strokeDasharray="3 3" />
            <XAxis dataKey="name" {...commonAxisProps} interval={0} />
            <YAxis {...commonAxisProps} tickFormatter={(v) => formatNumber(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#7a7a7a', paddingTop: 12 }} />
            <Line type="monotone" dataKey="views" stroke={accentColor} strokeWidth={2} dot={{ fill: accentColor, r: 3 }} />
            <Line type="monotone" dataKey="likes" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            <Line type="monotone" dataKey="comments" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
            <Line type="monotone" dataKey="shares" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
