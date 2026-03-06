import { useEffect, useState } from 'react'
import { DesktopNotesLayout } from './components/layout/DesktopNotesLayout'
import { PrivacyPolicyPage } from './components/help/PrivacyPolicyPage'
import { ShortcutsPage } from './components/help/ShortcutsPage'
import { LandingPage } from './components/landing/LandingPage'
import { APP_TITLE, MENU_ITEMS } from './constants/ui'

function getActivePath(): string {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const normalizedHashPath = window.location.hash.replace(/^#/, '').replace(/\/+$/, '') || '/'
  return normalizedHashPath !== '/' ? normalizedHashPath : normalizedPath
}

function App(): React.JSX.Element {
  const [activePath, setActivePath] = useState<string>(() => getActivePath())
  const isDesktopApp = /Electron/i.test(navigator.userAgent)

  useEffect(() => {
    const handleLocationChange = (): void => {
      setActivePath(getActivePath())
    }

    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  useEffect(() => {
    if (isDesktopApp) return

    const seoByPath: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'NoteNova Studio - Professional Notes Workspace',
        description: 'Write, edit, and export notes faster with NoteNova Studio on web and desktop.'
      },
      '/app': {
        title: 'NoteNova Studio App - Write, Organize, and Export Notes',
        description:
          'Open the NoteNova workspace for focused writing, smart editing tools, and quick exports.'
      },
      '/keyboard-shortcuts': {
        title: 'NoteNova Keyboard Shortcuts - Faster Editing Workflow',
        description:
          'Use powerful keyboard shortcuts in NoteNova Studio to speed up editing and note management.'
      },
      '/shortcuts': {
        title: 'NoteNova Keyboard Shortcuts - Faster Editing Workflow',
        description:
          'Use powerful keyboard shortcuts in NoteNova Studio to speed up editing and note management.'
      },
      '/privacy': {
        title: 'NoteNova Privacy Policy',
        description: 'Read the privacy policy and data usage terms for NoteNova Studio.'
      },
      '/privacy-policy': {
        title: 'NoteNova Privacy Policy',
        description: 'Read the privacy policy and data usage terms for NoteNova Studio.'
      }
    }

    const seo = seoByPath[activePath] ??
      seoByPath['/'] ?? {
        title: 'NoteNova Studio',
        description: 'Professional note-taking workspace.'
      }

    document.title = seo.title
    const descriptionMeta = document.querySelector('meta[name="description"]')
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', seo.description)
    }
  }, [activePath, isDesktopApp])

  useEffect(() => {
    if (isDesktopApp) return

    const appWindow = window as Window & {
      Tawk_API?: {
        showWidget?: () => void
        hideWidget?: () => void
      }
    }

    if (activePath === '/') {
      appWindow.Tawk_API?.showWidget?.()
      return
    }

    appWindow.Tawk_API?.hideWidget?.()
  }, [activePath, isDesktopApp])

  if (activePath === '/keyboard-shortcuts' || activePath === '/shortcuts') {
    return <ShortcutsPage />
  }

  if (activePath === '/privacy' || activePath === '/privacy-policy') {
    return <PrivacyPolicyPage />
  }

  if (isDesktopApp) {
    return <DesktopNotesLayout appTitle={APP_TITLE} menuItems={MENU_ITEMS} />
  }

  if (activePath === '/app') {
    return <DesktopNotesLayout appTitle={APP_TITLE} menuItems={MENU_ITEMS} />
  }

  return <LandingPage />
}

export default App
