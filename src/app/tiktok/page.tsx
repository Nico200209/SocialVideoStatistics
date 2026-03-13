import DashboardView from '@/components/DashboardView'

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0050">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.28 8.28 0 004.84 1.54V7.05a4.84 4.84 0 01-1.07-.36z" />
    </svg>
  )
}

export default function TikTokPage() {
  return (
    <DashboardView
      platform="tiktok"
      title="TikTok"
      subtitle="Performance across all tracked TikTok videos"
      accentColor="#ff0050"
      headerIcon={<TikTokIcon />}
    />
  )
}
