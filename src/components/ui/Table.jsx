export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 bg-white ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${className}`}>
      {children}
    </th>
  )
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>
}

export function Tr({ children, className = '' }) {
  return <tr className={`hover:bg-gray-50/70 transition-colors ${className}`}>{children}</tr>
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
}
