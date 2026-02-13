import { IconType } from 'react-icons'
import {
  FiArchive,
  FiBriefcase,
  FiFileText,
  FiHeart,
  FiRefreshCcw,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiUser
} from 'react-icons/fi'
import { HiOutlineTemplate } from 'react-icons/hi'
import { LuLightbulb } from 'react-icons/lu'
import { Notebook, NoteTag } from '../../types/notes'

interface NavigationSidebarProps {
  notebooks: Notebook[]
  tags: NoteTag[]
  activeNotebookId: string
  onNotebookChange: (notebookId: string) => void
}

const notebookIcon: Record<string, IconType> = {
  all: FiFileText,
  fav: FiHeart,
  work: FiBriefcase,
  pers: FiUser,
  idea: LuLightbulb,
  arch: FiArchive,
  trash: FiTrash2
}

export function NavigationSidebar({
  notebooks,
  tags,
  activeNotebookId,
  onNotebookChange
}: NavigationSidebarProps): React.JSX.Element {
  return (
    <aside className="column-sidebar">
      <div className="section-head">Notebooks</div>

      <ul className="sidebar-list">
        {notebooks.map((notebook) => {
          const Icon = notebookIcon[notebook.icon] ?? FiFileText
          return (
            <li key={notebook.id}>
              <button
                type="button"
                className={`sidebar-item ${activeNotebookId === notebook.id ? 'sidebar-item-active' : ''}`}
                onClick={() => onNotebookChange(notebook.id)}
              >
                <span className="sidebar-icon">
                  <Icon aria-hidden />
                </span>
                <span>{notebook.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="section-divider" />
      <div className="section-head">Tags</div>
      <div className="tag-cloud">
        {tags.map((tag) => (
          <button key={tag.id} type="button" className="sidebar-tag">
            <span className="tag-dot" style={{ backgroundColor: tag.color }} />
            <span>{tag.label}</span>
          </button>
        ))}
      </div>

      <div className="section-divider" />
      <ul className="sidebar-mini">
        <li>
          <FiSearch aria-hidden />
          <span>Search</span>
        </li>
        <li>
          <HiOutlineTemplate aria-hidden />
          <span>Templates</span>
        </li>
        <li>
          <FiSettings aria-hidden />
          <span>Settings</span>
        </li>
        <li>
          <FiRefreshCcw aria-hidden />
          <span>Sync</span>
        </li>
      </ul>
    </aside>
  )
}
