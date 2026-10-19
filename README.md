# Reflection Link

### Portfolio Website

**[Visit the website on GitHub Pages](https://darc2600.github.io/Novelist-E-Portfolio/)**

> **Local storage only:** uploads and edits are saved in the current browser on the current device. They are **not uploaded to GitHub or backed up online**. Closing and reopening the site normally keeps them, but clearing site data, private browsing, or browser storage cleanup can remove them. Keep separate copies of important files.

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

## Features

| Area | What it offers |
| --- | --- |
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

### Website Stack

| Technology | Role in the website |
| --- | --- |
| Angular 21 | Standalone components, templates, forms, and reactive state through signals. |
| TypeScript 5.9 | Typed story scenes, choices, subjects, professors, and memory records. |
| HTML and CSS | Responsive layouts, dialogue panels, visual effects, and the cream-and-forest design. |
| PDF.js | In-page PDF rendering without depending on a browser's built-in PDF viewer. |
| localStorage | Persistence for subject records, professor profiles, and memory text. |
| IndexedDB | Persistence for uploaded note and journal files. |
| Angular SSR and Express | Server-rendered application support and production serving. |
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
│   │       ├── attachment-store.ts   File validation and IndexedDB storage
│   │       ├── attachment-preview.ts Image and file preview presentation
│   │       └── pdf-preview.ts      Embedded PDF loading and page rendering
│   ├── styles.css                 Shared visual-novel styling and responsive rules
│   └── server.ts                  Express server entry point
├── angular.json                   Build, asset, development-server, and test configuration
├── package.json                   Dependencies and npm commands
└── SUBJECT-ARCHIVE.md              Detailed archive usage and storage notes
```

Test files are kept alongside their corresponding components and services as `*.spec.ts`.

## Data and Storage

### What to expect on the published website

| Situation | What happens |
| --- | --- |
| Close the site and return in the same browser | Saved content normally remains, while the site's browser storage is intact. |
| Open another device, browser, or browser profile | It has a separate archive; your existing uploads and edits will not appear. |
| Share the website link | Visitors see the bundled starter content and their own local changes, not your uploaded portfolio. |
| Move from localhost to GitHub Pages, or change the website domain | Existing browser data does not transfer automatically. |
| Clear browser/site data or use private browsing | Saved work may be lost; private-session data is usually removed when that session ends. |
| Browser storage is blocked or full | Saving or uploading may fail; the interface displays an error. |
| Export JSON or Markdown | Memory text and metadata can be exported; attachment files are not embedded, and import/restore is not implemented. |

There are no accounts, cloud backups, cross-device synchronization, or public links to a user's locally edited portfolio. The site is not an offline application; loading it and opening external project links may require internet access. GitHub Pages serves the static website and does not run the optional Express server.

The archive stores information locally in the current browser and website origin:

- **Subject information, professor profiles, and memory text** use the versioned localStorage key `reflection-link.subject-archive.v1`.
- **Attachment files** use the IndexedDB database `reflection-link-attachments`; their metadata stays with the relevant memory record.
- **Professor pictures** are resized and stored with their profiles.
- **Initial content** is copied from the original story reflections and linked projects on the first archive visit.

The application has no account-based synchronization. Content saved on one browser or website origin does not automatically appear on another. Clearing site data removes locally saved records and attachments.

JSON and Markdown exports provide backups of subject information and memory content. JSON exports include attachment metadata, but **not the attachment files themselves**. Download important files separately. Exports do not currently provide an import or restore workflow.

## Development

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
| `npm run watch` | Rebuild in development mode when files change. |
| `npm test` | Start the unit-test runner. |
| `npm test -- --watch=false` | Run the test suite once. |
| `npm run serve:ssr:NovelPortfolio` | Serve the production build. |

Tests cover story navigation, subject-specific memory lists, hallway pagination, professor customization, persistence behavior, upload validation, attachment previews, and PDF page navigation.

### Where to Make Changes

- Edit [story.ts](src/app/story/story.ts) to update the original story dialogue and reflection content.
- Edit [generate-storyline.ts](src/app/subjects/generate-storyline.ts) to change the structure and variations of additional subject chapters.
- Edit [backgrounds.ts](src/app/story/backgrounds.ts) and add assets to `public/backgrounds/` to change scene settings.
- Edit [styles.css](src/styles.css) for shared story styling, or the component CSS files for individual screens.
- Edit [models.ts](src/app/subjects/models.ts) and [archive-store.ts](src/app/subjects/archive-store.ts) when changing archive data and persistence.

## Further Information

- [Subject archive guide](SUBJECT-ARCHIVE.md)
- [Background asset sources](public/backgrounds/SOURCES.md)
