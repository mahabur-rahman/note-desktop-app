# NoteNova Studio (`note-desktop-app`)

Professional hybrid note application for:

1. Web (`/`, `/app`, `/keyboard-shortcuts`, `/privacy`)
2. Desktop (Electron app with SQLite persistence)

Tech stack:

1. Electron + Electron Builder
2. React + TypeScript
3. Tailwind CSS
4. SQLite (`better-sqlite3`)

## 1. Prerequisites

Install:

1. Node.js 20+ and npm
2. Git
3. Linux packaging dependencies (for Linux builds):

```bash
sudo apt update
sudo apt install -y binutils libfuse2
```

Notes:

1. `binutils` provides `ar` (required for `.deb` target).
2. `libfuse2` is required to run `.AppImage` directly.

## 2. Install

```bash
npm install
```

## 3. Development Run

Run desktop dev mode:

```bash
npm run dev
```

Behavior:

1. Electron window opens.
2. Renderer runs in dev server mode.
3. DevTools auto-open in development.

## 4. Quality Checks

Run lint:

```bash
npm run lint
```

Run typecheck:

```bash
npm run typecheck
```

Run both main/web checks separately:

```bash
npm run typecheck:node
npm run typecheck:web
```

## 5. Build Commands

## 5.1 Compile app code

```bash
npm run build
```

This creates compiled runtime artifacts in:

1. `out/main`
2. `out/preload`
3. `out/renderer`

## 5.2 Package installables

Linux:

```bash
npm run build:linux
```

Windows:

```bash
npm run build:win
```

macOS:

```bash
npm run build:mac
```

Installable/package outputs are created in:

1. `dist/`

Typical Linux outputs:

1. `dist/*.AppImage`
2. `dist/*.deb`
3. `dist/*.snap`

## 6. Production Testing

## 6.1 Desktop production preview (without packaging)

```bash
npm run build
npm run start
```

`npm run start` uses `electron-vite preview` to run compiled app.

## 6.2 Linux package testing

Build:

```bash
npm run build:linux
```

Run AppImage:

```bash
chmod +x dist/note-desktop-app-1.0.0.AppImage
./dist/note-desktop-app-1.0.0.AppImage
```

If FUSE error appears:

1. Install `libfuse2`, or
2. Extract AppImage:

```bash
./dist/note-desktop-app-1.0.0.AppImage --appimage-extract
```

## 6.3 Web production testing

Build assets:

```bash
npm run build
```

Serve renderer output:

```bash
npx serve out/renderer
```

Then open the printed local URL in browser.

## 7. Script Reference

1. `npm run dev` -> Electron development mode
2. `npm run lint` -> ESLint
3. `npm run typecheck` -> node + web TypeScript check
4. `npm run build` -> compile main/preload/renderer
5. `npm run start` -> preview compiled app
6. `npm run build:linux` -> Linux package build
7. `npm run build:win` -> Windows package build
8. `npm run build:mac` -> macOS package build

## 8. Folder Guide

1. `src/main` -> Electron main process (window, IPC, DB)
2. `src/preload` -> secure renderer bridge
3. `src/renderer` -> React UI
4. `docs/docs.md` -> full architecture and feature-level technical documentation
5. `out/` -> compiled runtime code
6. `dist/` -> packaged installers/artifacts

## 9. Documentation Rule (Important)

For every feature/update/fix:

1. Update `docs/docs.md` with architecture/logic impact.
2. Update `README.md` if setup/build/run/testing workflow is affected.
3. Commit code + docs together in same change set.
