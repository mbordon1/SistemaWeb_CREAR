export function Table({ children, className = '', plain = false }) {
  const wrapper = plain
    ? `overflow-x-auto ${className}`
    : `overflow-x-auto rounded-2xl border border-[#EDE9FE] bg-white ${className}`
  return (
    <div className={wrapper}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-[#F9F7FF] border-b border-[#EDE9FE]">
      {children}
    </thead>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-[11px] font-semibold text-[#A89FC8] uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-[#F4F2FF]">{children}</tbody>
}

export function Tr({ children, className = '' }) {
  return <tr className={`hover:bg-[#F9F7FF] transition-colors ${className}`}>{children}</tr>
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3.5 text-[#374151] ${className}`}>{children}</td>
}
