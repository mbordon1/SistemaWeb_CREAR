const colors = {
  green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red:    'bg-red-50 text-red-600 ring-1 ring-red-200',
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  blue:   'bg-primary-light text-primary ring-1 ring-purple-200',
  gray:   'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
