export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-purple-800/30 ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-white/3 border-b border-purple-800/30">
      {children}
    </thead>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-purple-300/70 uppercase tracking-wide ${className}`}>
      {children}
    </th>
  )
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-purple-800/20">{children}</tbody>
}

export function Tr({ children, className = '' }) {
  return <tr className={`hover:bg-white/3 transition-colors ${className}`}>{children}</tr>
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-purple-100 ${className}`}>{children}</td>
}
