import { useEffect } from 'react'
import { FiClock, FiRotateCcw, FiX } from 'react-icons/fi'
import type { NoteVersionRecord } from '../../types/ui'
import { IconButton } from './IconButton'

interface VersionHistoryModalProps {
  isOpen: boolean
  versions: NoteVersionRecord[]
  onRestoreVersion: (versionId: string) => void
  onClose: () => void
}

function formatSavedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function VersionHistoryModal({
  isOpen,
  versions,
  onRestoreVersion,
  onClose
}: VersionHistoryModalProps): React.JSX.Element | null {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[75] grid place-items-center bg-[#0b1324]/60 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Version history"
        className="w-full max-w-[720px] overflow-hidden rounded-xl border border-[#cfdaec] bg-[#f8fbff] shadow-[0_20px_34px_rgba(16,27,46,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8e1f0] px-4 py-3">
          <h2 className="m-0 flex items-center gap-2 text-[21px] leading-none font-semibold text-[#273b5c]">
            <FiClock />
            <span>Version History</span>
          </h2>
          <IconButton
            ariaLabel="Close version history"
            className="cursor-pointer rounded p-1 text-[22px] text-[#304a72] transition hover:bg-[#eaf1fc]"
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {versions.length === 0 ? (
            <p className="m-0 rounded-lg bg-[#edf3ff] px-4 py-6 text-center text-[15px] text-[#3f567b]">
              No saved versions yet.
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="mb-2.5 rounded-lg border border-[#d6e0f0] bg-white px-3 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[15px] font-semibold text-[#274063]">
                      {version.title || 'Untitled Note'}
                    </p>
                    <p className="mt-1 mb-0 text-[13px] text-[#5e7392]">
                      {formatSavedAt(version.savedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#4f63f6] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#4158e8]"
                    onClick={() => {
                      onRestoreVersion(version.id)
                      onClose()
                    }}
                  >
                    <FiRotateCcw />
                    <span>Restore</span>
                  </button>
                </div>
                <pre className="mt-2 max-h-24 overflow-hidden rounded bg-[#f4f7ff] px-2 py-2 text-xs whitespace-pre-wrap text-[#3d5374]">
                  {version.content || 'Blank'}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
