import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import type { EditorFontSettings } from '../../types/ui'
import { IconButton } from '../common/IconButton'

interface FontSettingsModalProps {
  isOpen: boolean
  settings: EditorFontSettings
  onChange: (settings: EditorFontSettings) => void
  onReset: () => void
  onClose: () => void
}

const fontFamilyOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", "Comic Sans", cursive' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' }
] as const

const fontSizeOptions = [14, 16, 18, 20, 22] as const
const fontWeightOptions = [
  { label: 'Regular', value: 400 as const },
  { label: 'Bold', value: 700 as const }
] as const
const fontStyleOptions = [
  { label: 'Normal', value: 'normal' as const },
  { label: 'Italic', value: 'italic' as const }
] as const
const lineSpaceOptions = [
  { label: 'Single', value: 1 as const },
  { label: '1.15', value: 1.15 as const },
  { label: '1.5', value: 1.5 as const },
  { label: 'Double', value: 2 as const }
] as const

const optionBaseClass =
  'w-full cursor-pointer px-2 py-0.5 text-left text-[15px] text-[#1f2d45] hover:bg-[#e2e4e8]'

export function FontSettingsModal({
  isOpen,
  settings,
  onChange,
  onReset,
  onClose
}: FontSettingsModalProps): React.JSX.Element | null {
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
        aria-label="Font settings"
        className="w-full max-w-[620px] overflow-hidden rounded-[3px] border border-[#d8dde5] bg-[#f7f8fa]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8dde5] px-4 py-2.5">
          <h2 className="m-0 text-[35px] leading-none font-semibold text-[#29334a]">Font</h2>
          <IconButton
            ariaLabel="Close font settings modal"
            onClick={onClose}
            className="cursor-pointer p-1 text-[22px] text-[#26324a]"
          >
            <FiX />
          </IconButton>
        </div>

        <div className="space-y-4 border-b border-[#d8dde5] px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[15px] text-[#1f2d45]">Font</p>
              <div className="h-[102px] overflow-y-auto border border-[#c9ced7] bg-[#f3f4f6]">
                {fontFamilyOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={[
                      optionBaseClass,
                      settings.fontFamily === option.value ? 'bg-[#d2d4d8]' : ''
                    ].join(' ')}
                    onClick={() =>
                      onChange({
                        ...settings,
                        fontFamily: option.value
                      })
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-[15px] text-[#1f2d45]">Size</p>
              <div className="h-[102px] overflow-y-auto border border-[#c9ced7] bg-[#f3f4f6]">
                {fontSizeOptions.map((sizeValue) => (
                  <button
                    key={sizeValue}
                    type="button"
                    className={[
                      optionBaseClass,
                      settings.fontSize === sizeValue ? 'bg-[#d2d4d8]' : ''
                    ].join(' ')}
                    onClick={() =>
                      onChange({
                        ...settings,
                        fontSize: sizeValue
                      })
                    }
                  >
                    {`${sizeValue}pt`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-[15px] text-[#1f2d45]">Weight</p>
              <div className="h-[74px] overflow-y-auto border border-[#c9ced7] bg-[#f3f4f6]">
                {fontWeightOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={[
                      optionBaseClass,
                      settings.fontWeight === option.value ? 'bg-[#d2d4d8]' : ''
                    ].join(' ')}
                    onClick={() =>
                      onChange({
                        ...settings,
                        fontWeight: option.value
                      })
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-[15px] text-[#1f2d45]">Style</p>
              <div className="h-[74px] overflow-y-auto border border-[#c9ced7] bg-[#f3f4f6]">
                {fontStyleOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={[
                      optionBaseClass,
                      settings.fontStyle === option.value ? 'bg-[#d2d4d8]' : ''
                    ].join(' ')}
                    onClick={() =>
                      onChange({
                        ...settings,
                        fontStyle: option.value
                      })
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-[15px] text-[#1f2d45]">Line space</p>
              <div className="h-[74px] overflow-y-auto border border-[#c9ced7] bg-[#f3f4f6]">
                {lineSpaceOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={[
                      optionBaseClass,
                      settings.lineHeight === option.value ? 'bg-[#d2d4d8]' : ''
                    ].join(' ')}
                    onClick={() =>
                      onChange({
                        ...settings,
                        lineHeight: option.value
                      })
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-4 py-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-w-[98px] cursor-pointer items-center justify-center rounded bg-[#4f63f6] px-4 py-2 text-[16px] text-white"
          >
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}
