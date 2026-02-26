import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { IconButton } from './IconButton'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps): React.JSX.Element | null {
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1324]/60 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="About"
        className="w-full max-w-[620px] overflow-hidden rounded-xl border border-[#cfdaec] bg-[#f8fbff] shadow-[0_20px_34px_rgba(16,27,46,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8e1f0] px-4 py-3">
          <h2 className="m-0 text-[21px] leading-none font-semibold text-[#273b5c]">About</h2>
          <IconButton
            ariaLabel="Close about modal"
            className="cursor-pointer rounded p-1 text-[22px] text-[#304a72] transition hover:bg-[#eaf1fc]"
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="px-6 py-8 text-center text-[#1f2d45]">
          <h3 className="m-0 text-[24px] leading-none font-semibold text-[#253a5c]">
            Online Notepad
          </h3>
          <p className="mt-2 mb-6 text-[15px] font-medium text-[#516685]">Version 1.0</p>
          <p className="mx-auto max-w-[560px] text-[16px] leading-[1.5] text-[#3f5473]">
            Feel free to send comments, suggestions and bug reports to annur4395@gmail.com.
            I&apos;ll try to implement it if it&apos;s feasible.
          </p>
          <p className="mt-8 text-[16px] font-semibold text-[#2d4368]">
            Copyright &copy; {currentYear}
          </p>
        </div>
      </div>
    </div>
  )
}
