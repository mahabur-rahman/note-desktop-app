import { FiFileText } from 'react-icons/fi'

interface AppBrandProps {
  title: string
}

export function AppBrand({ title }: AppBrandProps): React.JSX.Element {
  return (
    <div className="mx-3 mt-3 mb-1 flex items-center gap-2 rounded-md bg-white px-3 py-2 text-[#2f3440] shadow-[0_1px_2px_rgba(31,35,45,0.08)]">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#5165f7] text-white">
        <FiFileText className="text-[15px]" />
      </span>
      <span className="truncate text-sm font-semibold">{title}</span>
    </div>
  )
}
