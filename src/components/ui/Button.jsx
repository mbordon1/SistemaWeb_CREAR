const variants = {
  primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:from-violet-500 hover:to-fuchsia-400 shadow-lg shadow-violet-900/30 disabled:opacity-50',
  secondary: 'bg-white/5 border border-purple-700/50 text-purple-200 hover:bg-white/10 hover:border-purple-600/60',
  danger: 'bg-red-600/80 text-white hover:bg-red-500 border border-red-500/50',
  ghost: 'text-purple-300 hover:bg-white/5',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
