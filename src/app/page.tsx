import DashboardView from '@/components/DashboardView'

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <DashboardView
      title="Overview"
      subtitle="All platforms combined performance"
      accentColor="#06b6d4"
      headerIcon={<DashboardIcon />}
    />
  )
}
