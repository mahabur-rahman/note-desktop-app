import { useEffect, useMemo, useState } from 'react'
import { FiCommand, FiSearch, FiX } from 'react-icons/fi'
import { IconButton } from './IconButton'

export interface CommandPaletteAction {
  id: string
  title: string
  subtitle: string
  keywords: string[]
  onSelect: () => void
}

interface CommandPaletteModalProps {
  isOpen: boolean
  actions: CommandPaletteAction[]
  onClose: () => void
}

export function CommandPaletteModal({
  isOpen,
  actions,
  onClose
}: CommandPaletteModalProps): React.JSX.Element | null {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredActions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) return actions

    return actions.filter((action) => {
      const source = [action.title, action.subtitle, ...action.keywords]
        .join(' ')
        .toLocaleLowerCase()
      return source.includes(normalizedQuery)
    })
  }, [actions, query])
  const normalizedActiveIndex = Math.min(activeIndex, Math.max(filteredActions.length - 1, 0))

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(filteredActions.length - 1, 0)))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        return
      }

      if (event.key === 'Enter') {
        const activeAction = filteredActions[normalizedActiveIndex]
        if (!activeAction) return
        event.preventDefault()
        activeAction.onSelect()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredActions, isOpen, normalizedActiveIndex, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[#0b1324]/60 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-[680px] overflow-hidden rounded-xl border border-[#cfdaec] bg-[#f8fbff] shadow-[0_24px_42px_rgba(16,27,46,0.38)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8e1f0] px-4 py-3">
          <h2 className="m-0 flex items-center gap-2 text-[20px] leading-none font-semibold text-[#273b5c]">
            <FiCommand />
            <span>Command Palette</span>
          </h2>
          <IconButton
            ariaLabel="Close command palette"
            className="cursor-pointer rounded p-1 text-[22px] text-[#304a72] transition hover:bg-[#eaf1fc]"
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="border-b border-[#d8e1f0] p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#7f8ea8]" />
            <input
              autoFocus
              type="text"
              aria-label="Search commands"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              placeholder="Type a command..."
              className="h-11 w-full rounded border border-[#c9d4e8] bg-white pr-3 pl-10 text-[15px] text-[#243650] outline-none focus:border-[#93a8d2]"
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="rounded-lg px-3 py-6 text-center text-sm text-[#617590]">
              No command found.
            </div>
          ) : (
            filteredActions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className={[
                  'w-full cursor-pointer rounded-lg px-3 py-2 text-left transition',
                  index === normalizedActiveIndex
                    ? 'bg-[#e8efff] text-[#233f66]'
                    : 'text-[#2d456b] hover:bg-[#edf2fd]'
                ].join(' ')}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  action.onSelect()
                  onClose()
                }}
              >
                <p className="m-0 text-[15px] font-semibold">{action.title}</p>
                <p className="mt-0.5 mb-0 text-[13px] text-[#5f7494]">{action.subtitle}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
