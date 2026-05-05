export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-purple-300/80 uppercase tracking-wide">{label}</label>}
      <select
        className={`w-full rounded-lg bg-[#1a1547] border border-purple-800/40 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-colors ${error ? 'border-red-500/60' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
