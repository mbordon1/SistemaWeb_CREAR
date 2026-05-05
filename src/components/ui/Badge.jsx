const colors = {
  green:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  red:    'bg-red-500/15 text-red-400 border border-red-500/25',
  yellow: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  blue:   'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  gray:   'bg-white/5 text-purple-300 border border-purple-800/30',
}

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
