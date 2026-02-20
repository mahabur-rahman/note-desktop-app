import {
  FiAlignLeft,
  FiCheckCircle,
  FiMaximize2,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2
} from 'react-icons/fi'

function App(): React.JSX.Element {
  return (
    <main className="desktop-app">
      <aside className="notes-sidebar">
        <div className="sidebar-inner">
          <button className="new-note-btn" type="button">
            <FiPlus />
            <span>Create new</span>
          </button>

          <div className="search-row">
            <input aria-label="Search notes" placeholder="Search..." readOnly />
            <FiSearch />
          </div>

          <div className="sidebar-toolbar">
            <button type="button" aria-label="Filter notes">
              <FiAlignLeft />
            </button>
            <button type="button" aria-label="More actions">
              <FiMoreVertical />
            </button>
          </div>
        </div>

        <article className="note-card active">
          <h3>Untitled Note</h3>
          <p>Blank</p>
          <span>just now</span>
        </article>
      </aside>

      <section className="editor-pane">
        <header className="menu-row">
          <nav>
            <button type="button">File</button>
            <button type="button">Edit</button>
            <button type="button">Insert</button>
            <button type="button">Format</button>
            <button type="button">Tools</button>
            <button type="button">View</button>
            <button type="button">Help</button>
          </nav>
          <button type="button" className="window-btn" aria-label="Fullscreen">
            <FiMaximize2 />
          </button>
        </header>

        <div className="title-row">
          <input aria-label="Note title" defaultValue="Untitled Note" />
          <button type="button" className="icon-btn" aria-label="Delete note">
            <FiTrash2 />
          </button>
        </div>

        <div className="editor-canvas" />

        <div className="status-dot" aria-hidden="true">
          <FiCheckCircle />
        </div>
      </section>
    </main>
  )
}

export default App
