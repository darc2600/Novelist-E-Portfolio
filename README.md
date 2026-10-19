# Reflection Link

### Portfolio Website

| Version | Website | Storage |
| --- | --- | --- |
| **Shared online portfolio** | [Open on Vercel](https://novel-e-portfolio.vercel.app/) | Subjects, names, stories, and uploaded files are saved online and visible across devices. |
| Browser-only version | [Open on GitHub Pages](https://darc2600.github.io/Novelist-E-Portfolio/) | Edits and uploads stay in the current browser on the current device. |

> **Shared editing:** the Vercel version has no login. Anyone with the link can view, upload, edit, or delete portfolio content. Search-engine `noindex` requests discourage listing but do not make the site private. Keep separate backups of important work.

*A visual study journal about the lessons that stayed.*

Reflection Link is an interactive academic portfolio presented as a visual novel. Instead of browsing a conventional collection of pages, visitors explore a campus, meet professors, and revisit the projects, notes, and journal entries connected to each subject.

The website combines a story-driven experience with a personal subject dashboard, making academic work easy to organize and explore.

---

## Explore the Project

[Website Experience](#website-experience) · [Features](#features) · [Technology](#technology) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Data and Storage](#data-and-storage) · [Development](#development)

## Website Experience

1. **Begin the story.** Enter the campus through the start screen and follow the narration.
2. **Choose a professor.** Explore faculty hallways, with up to five subject choices in each hallway. Additional subjects are available through the next-hallway option.
3. **Choose a category.** Select Projects & Links, Notes, or Journal to begin a category-specific conversation.
4. **Revisit an entry.** Choose a saved item to read its contents, open project links, or preview attached images and PDFs.
5. **Continue exploring.** Return to the conversation or visit another professor.

To manage content, open **Subjects** from the start screen. Select a subject card to open its dashboard.

To personalize the start screen, edit **Portfolio name** below **My Subjects** and choose **Save name**. The credit updates to **Your Name - Portfolio Website**. On Vercel, that name is shared with everyone opening the portfolio.

## Features

| Area | What it offers |
| --- | --- |
| Portfolio name | Edit the name from Subjects; the saved name appears on the start screen. |
| Shared online archive | Save the same portfolio and attachments across browsers and devices on Vercel. |
| Interactive story | Typewriter dialogue, response choices, scene transitions, illustrated settings, and route progress. |
| Subject organization | Add subjects with a name, code, optional semester, description, color, and typed professor name. Search, archive, restore, or delete subjects. |
| Subject dashboards | Dedicated Overview, Professor, Projects & Links, Notes, Journal, and Memory sections. |
| Professor profiles | Editable names and uploaded character pictures that appear in story dialogue and subject cards. |
| Projects & Links | Save project titles, descriptions, tags, and HTTP/HTTPS links. |
| Notes | Write notes, use simple heading and list formatting, pin important entries, and search saved content. |
| Journal | Record dated reflections with optional moods and tags, then search or filter by date. |
| Attachments | Add images and PDFs to notes and journal entries, with previews in the editor, dashboard, and story. |
| Embedded PDF reader | Read PDF pages inside the website with Previous/Next controls, readable page text, and Open/Download options. |
| Additional subject stories | New subjects receive randomized story chapters that follow the portfolio's professor-and-reflection flow. |
| Memory export | Export a subject's saved memories as JSON or Markdown. |

Every subject keeps its own entries. Category lists, dashboard counts, and memory exports are scoped to the selected subject.

### Upload Support

| Upload | Supported formats | Limit |
| --- | --- | --- |
| Professor picture | JPG, JPEG, PNG, WebP | 5 MB per picture; resized before saving. |
| Note and journal attachments | JPG, JPEG, PNG, WebP, PDF | Up to 5 files per entry, 10 MB per file. |

Professor pictures support a live preview and vertical positioning. Attachment files can be previewed, removed, opened, or downloaded.

## Technology

### Applications Used

| Application | Purpose |
| --- | --- |
| Visual Studio Code | Code editing and website development. |
| Figma | Interface design and visual planning. |

### Visual Inspiration

The website's visual novel style is inspired by the **Date A Live** visual novels, particularly their character-focused dialogue scenes and response-choice presentation. Reflection Link adapts that inspiration into an academic portfolio with its own content and visual theme.

The background images used in the website are from the mobile game **Blue Archive**. These assets belong to their respective copyright holders and are not original artwork created for this project.

### Website Stack

| Technology | Role in the website |
| --- | --- |
| Angular 21 | Standalone components, templates, forms, and reactive state through signals. |
| TypeScript 5.9 | Typed story scenes, choices, subjects, professors, and memory records. |
| HTML and CSS | Responsive layouts, dialogue panels, visual effects, and the cream-and-forest design. |
| PDF.js | In-page PDF rendering without depending on a browser's built-in PDF viewer. |
| Supabase Postgres | Shared portfolio name, subjects, professor profiles, storylines, and memory records. |
| Supabase Storage | Shared note and journal image/PDF files. |
| Vercel | Hosting for the online version, with root-path assets and `noindex` headers. |
| localStorage | Subject records, profiles, and text in browser-only mode. |
| IndexedDB | Uploaded note and journal files in browser-only mode. |
| Angular prerendering and Express | Static deployment builds, plus optional server rendering and local production serving. |
| Vitest and Angular TestBed | Automated component and behavior tests. |

The interface uses **Fraunces** for display typography and **Outfit** for interface text. Story background images are bundled with the application.

## Getting Started

### Requirements

- Node.js **20.19+ on the 20.x release line**, **22.13+ on the 22.x release line**, or a compatible newer release.
- npm.

### Install and Run

From the `NovelPortfolio` directory:

```bash
npm ci
npm start
```

Open **http://localhost:4200/** in your browser. The development server reloads the application when source files change.

Local development defaults to browser-only storage. To connect it to the shared online archive, follow [Vercel setup](docs/VERCEL-SETUP.md#local-development).

Press **Ctrl+C** in the terminal to stop the server.

### Production Build

```bash
npm run build
```

Build output is written to `dist/NovelPortfolio/`. It includes browser assets, the server bundle, and the locally served PDF renderer assets.

To run the built server:

```bash
npm run serve:ssr:NovelPortfolio
```

The server uses port **4000** by default and supports a `PORT` environment variable.

## Project Structure

```text
NovelPortfolio/
├── public/
│   └── backgrounds/                Illustrated scene assets and source information
├── src/
│   ├── app/
│   │   ├── app.ts                  Story playback, choices, hallways, and memory browsing
│   │   ├── app.html                Main story and start-screen templates
│   │   ├── app.css                 Application-specific presentation
│   │   ├── app.config.ts          Application providers and hydration configuration
│   │   ├── story/
│   │   │   ├── story.ts            Original scenes, dialogue, and reflection content
│   │   │   ├── types.ts            Story, character, choice, and reflection types
│   │   │   └── backgrounds.ts      Shared background asset paths
│   │   └── subjects/
│   │       ├── subjects.ts         Subject dashboards, forms, and upload interactions
│   │       ├── subjects.html       Subject and memory management interface
│   │       ├── subjects.css        Dashboard and editor styling
│   │       ├── models.ts           Subject, professor, memory, and attachment models
│   │       ├── archive-store.ts    Archive initialization and record persistence
│   │       ├── generate-storyline.ts  Additional subject chapter composition
│   │       ├── online-portfolio.ts   Shared database and file-storage requests
│   │       ├── attachment-store.ts   File validation and online/local storage
│   │       ├── attachment-preview.ts Image and file preview presentation
│   │       └── pdf-preview.ts      Embedded PDF loading and page rendering
│   ├── styles.css                 Shared visual-novel styling and responsive rules
│   └── server.ts                  Express server entry point
├── docs/VERCEL-SETUP.md            Online setup, publishing steps, and limitations
├── scripts/configure-online.mjs    Public online configuration generated at build time
├── supabase/setup.sql              Database, save function, file bucket, and access rules
├── vercel.json                     Vercel build/output settings and noindex headers
├── angular.json                   Build, asset, development-server, and test configuration
├── package.json                   Dependencies and npm commands
└── SUBJECT-ARCHIVE.md              Detailed archive usage and storage notes
```

Test files are kept alongside their corresponding components and services as `*.spec.ts`.

## Data and Storage

### Shared online version — Vercel

The Vercel app loads one shared archive from **Novel E-Portfolio**, the Supabase project. It saves portfolio names, subjects, professor pictures, generated stories, and memory text in the database. Note and journal attachment bytes are stored in the `portfolio-files` bucket.

| Situation | Online behavior |
| --- | --- |
| Close the website and return | Saved online content remains available while the backend service is available. |
| Open the same link on another device or browser | The same saved portfolio and uploaded files are available. |
| Change the portfolio name | The start-page credit uses the saved name; reload other open browsers to see it. |
| Save an entry | The editor waits for online confirmation before closing. |
| Someone else saved a newer version | A stale save is rejected to avoid silently overwriting their changes. Copy your draft before reloading. |
| The network or storage service is unavailable | Loading or saving displays an error. Online mode does not silently fall back to a separate local archive. |
| Share the website link | Recipients can view **and edit or delete** the shared content without logging in. |

Professor pictures are resized before saving. Upload and storage limits still apply. `noindex` is not authentication or an access restriction. There is no automatic live update of already-open pages; reload to pick up changes made elsewhere.

### Browser-only version — GitHub Pages and default local development

- Subject records, professor pictures, portfolio name, and memory text use localStorage.
- Note and journal file bytes use IndexedDB.
- Returning in the same browser normally preserves saved work, provided the site's browser storage remains intact.
- Other devices, browsers, profiles, and website origins have separate archives.
- Clearing site data, private browsing, or browser storage cleanup can remove saved content. Blocked or full storage can prevent saves.
- Sharing the GitHub Pages URL does not share your locally uploaded portfolio.

### Existing content and backups

Existing localhost or GitHub Pages uploads **do not automatically transfer to Vercel**. Re-enter existing entries and upload their original files on the online site. The Vercel origin cannot read another site's browser storage.

JSON and Markdown exports include memory text and metadata, but **not attachment file bytes**. Automatic import/restore and full-file backup exports are not implemented. Download important files separately and retain original copies. The website is not an offline application; loading it and opening external project links may require internet access.

## Development

### Vercel deployment

The online branch is **`alternate-online-version`**. The live site is **https://novel-e-portfolio.vercel.app/**. Its current deployment was uploaded directly from local source; changes are not published merely by editing files locally.

Follow [the Vercel setup and deployment guide](docs/VERCEL-SETUP.md) for environment variables, database setup, and publishing. The build command is:

```bash
npm run build:vercel
```

It requires `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, generates public browser configuration, and builds static files into `dist/NovelPortfolio/browser/`. Never supply a secret or `service_role` key. Generated configuration and `.env` files are ignored by Git.

GitHub commits/pushes and publishing are performed by the repository owner. Keep this branch separate from `main` to retain the browser-only GitHub Pages version.

### GitHub Pages deployment

The repository publishes the static Angular build to **https://darc2600.github.io/Novelist-E-Portfolio/**. The workflow in [.github/workflows/pages.yml](.github/workflows/pages.yml) tests, builds, and deploys pushes to `main`; it can also be started from the Actions tab.

To build the same files locally:

```bash
npm run build:pages
```

Deployable files are in `dist/NovelPortfolio/browser/`. The Pages configuration sets the repository base path so backgrounds, scripts, and PDF reader assets load from the correct address. In repository **Settings → Pages**, the deployment source is **GitHub Actions**. The normal server build remains available through `npm run build`.

### Useful Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the local development server. |
| `npm run build` | Create the production browser and server bundles. |
| `npm run build:vercel` | Build the configured shared online version for Vercel. |
| `npm run build:pages` | Build the GitHub Pages version with its repository base path. |
| `npm run watch` | Rebuild in development mode when files change. |
| `npm test` | Start the unit-test runner. |
| `npm test -- --watch=false` | Run the test suite once. |
| `npm run serve:ssr:NovelPortfolio` | Serve the production build. |

Tests cover story navigation, subject-specific memory lists, hallway pagination, professor customization, portfolio name persistence, failed online saves, stale-write rejection, upload validation, attachment previews, and PDF page navigation.

### Where to Make Changes

- Edit [story.ts](src/app/story/story.ts) to update the original story dialogue and reflection content.
- Edit [generate-storyline.ts](src/app/subjects/generate-storyline.ts) to change the structure and variations of additional subject chapters.
- Edit [backgrounds.ts](src/app/story/backgrounds.ts) and add assets to `public/backgrounds/` to change scene settings.
- Edit [styles.css](src/styles.css) for shared story styling, or the component CSS files for individual screens.
- Edit [models.ts](src/app/subjects/models.ts) and [archive-store.ts](src/app/subjects/archive-store.ts) when changing archive data and persistence.

## Further Information

- [Online deployment and setup guide](docs/VERCEL-SETUP.md)
- [Database setup SQL](supabase/setup.sql)

- [Subject archive guide](SUBJECT-ARCHIVE.md)
- [Background asset sources](public/backgrounds/SOURCES.md)
