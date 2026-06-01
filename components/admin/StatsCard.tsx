interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color?: 'blue' | 'red' | 'green' | 'orange'
}

const colorMap: Record<NonNullable<StatsCardProps['color']>, string> = {
  blue: 'bg-blue-50 border-tef-blue text-tef-blue',
  red: 'bg-red-50 border-tef-red text-tef-red',
  green: 'bg-blue-50 border-blue-500 text-blue-700',
  orange: 'bg-red-50 border-red-500 text-red-700',
}

export default function StatsCard({ title, value, subtitle, icon, color = 'blue' }: StatsCardProps) {
  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
        </div>
        <span className="text-4xl" role="img" aria-hidden="true">{icon}</span>
      </div>
    </div>
  )
}
