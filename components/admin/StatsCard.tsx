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
  green: 'bg-green-50 border-green-500 text-green-700',
  orange: 'bg-orange-50 border-orange-500 text-orange-700',
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
