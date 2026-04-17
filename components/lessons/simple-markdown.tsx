import type { ReactNode } from 'react'

function applyInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*[^*].*?[^*]\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
      return <em key={i} className="text-violet-700 not-italic font-medium">{part.slice(1, -1)}</em>
    }
    return part
  })
}

export function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc pl-5 space-y-1 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="text-slate-700 text-sm leading-relaxed">{applyInline(item)}</li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={key++} className="text-lg font-semibold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-slate-800 mt-4 mb-1">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      const isAmber = line.startsWith('⚠️')
      const isBlue = line.startsWith('💡')
      const isGreen = line.startsWith('✅')
      const isRed = line.startsWith('❌')

      if (isAmber || isBlue || isGreen || isRed) {
        const cls = isAmber
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : isBlue
          ? 'bg-blue-50 border-blue-200 text-blue-800'
          : isGreen
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
        elements.push(
          <div key={key++} className={`rounded-md border px-3 py-2 text-sm my-2 leading-relaxed ${cls}`}>
            {applyInline(line)}
          </div>
        )
      } else {
        elements.push(
          <p key={key++} className="text-slate-700 text-sm leading-relaxed my-2">
            {applyInline(line)}
          </p>
        )
      }
    }
  }
  flushList()

  return <div>{elements}</div>
}
