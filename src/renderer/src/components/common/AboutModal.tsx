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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="About"
        className="w-full max-w-[620px] overflow-hidden rounded-[4px] border border-[#d8dde5] bg-[#f7f8fa]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8dde5] px-4 py-2.5">
          <h2 className="m-0 text-[20px] leading-none font-semibold text-[#29334a]">About</h2>
          <IconButton
            ariaLabel="Close about modal"
            className="cursor-pointer p-1 text-[22px] text-[#26324a]"
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="px-6 py-8 text-center text-[#1f2d45]">
          <h3 className="m-0 text-[20px] leading-none font-semibold">Online Notepad</h3>
          <p className="mt-2 mb-6 text-[16px]">Version 1.0</p>
          <p className="mx-auto max-w-[560px] text-[17px] leading-[1.4]">
            Feel free to send comments, suggestions and bug reports to annur4395@gmail.com.
            I&apos;ll try to implement it if it&apos;s feasible.
          </p>
          <p className="mt-8 text-[17px]">Copyright &copy; {currentYear}</p>
        </div>
      </div>
    </div>
  )
}
