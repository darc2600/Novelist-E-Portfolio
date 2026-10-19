# Subject Management & Memory

PDF attachments are embedded using a locally bundled PDF.js canvas viewer instead of browser-specific PDF frames. The viewer includes Previous/Next page controls, readable page text, and Open/Download fallbacks for password-protected or unsupported documents. PDF.js loads only when a PDF is previewed; its worker, fonts, character maps, and WASM files are served with the app. No files are sent to an external viewing service.

Notes and Journal entries support up to five JPG/JPEG, PNG, WebP, or PDF attachments, up to 10 MB per file. Use **Attach pictures or PDFs** in the entry editor, review the previews, then Save. Attachments also appear in the story when that saved note or journal is selected. PDFs include Open and Download links if the browser cannot show an embedded preview. Cancel discards newly uploaded files; removing an existing attachment takes effect only after Save.

Attachment metadata is kept with the subject memory, while file contents are stored in the browser's IndexedDB database `reflection-link-attachments`. Files stay in the same browser and origin across reloads; clearing site data removes them. JSON exports contain attachment metadata, not the binary files. Download important attachments separately for backup.

Open **Subjects** in the top-left header of the start screen to manage subjects directly. The button appears only on the start screen. During the story, use the home button to return to the start screen when you need subject management.

Every newly created subject automatically receives a saved, locally composed branching storyline. Saving a new subject opens its dashboard; choose **Play subject storyline** in Overview to read it in the visual novel player. The chapter uses its subject details and assigned professor, offers three lesson recollections with memory-file reflections, returns to the professor conversation after each lesson, and lets you leave for the faculty building or subject dashboard. Professor names and uploaded pictures use the current assignment when played. Each subject owns separate scene IDs; its saved story survives reloads and is retained when subject details are edited. Existing subjects can use **Generate & play subject storyline** to add one without changing their memories. Story generation uses local templates and requires no AI service or network request.

- Add or edit a subject with a name, code, optional semester, description, color, and professor. Search by name, code, or semester. The filter includes archived subjects; Restore brings them back. Deletion requires confirmation and removes that subject's saved memories.
- Open a subject card to use Overview, Professor, Projects & Links, Notes, Journal, or Memory.
- In Professor, create a character or select an existing one. After creating a character, select it in the assignment dropdown. Characters can be reused across subjects; edits affect all their assignments.
- Upload JPG/JPEG, PNG, or WebP pictures up to 5 MB. Pictures are decoded, resized to at most 640 pixels, and saved with the character. Preview and reposition vertically, replace, or remove the picture before saving.
- Add project links using HTTP or HTTPS URLs. Add notes with `# Heading`, `- list item`, or numbered lists. Pin important notes. Add dated journal entries with optional mood and tags. Use Save to commit edits or Cancel to discard them; there is no background autosave.
- Search each memory category or use Memory to search all memories within the current subject. Journal supports date filtering and newest-first ordering. Memory exports that subject's saved data as JSON or Markdown, independently of active search filters.

## Storage and integration

This Angular application has no database, authentication, upload service, or AI chat. The archive uses a separate, versioned localStorage key (`reflection-link.subject-archive.v1`). Uploaded pictures are stored as resized data URLs alongside records. Changes survive reloads and reopening in the same browser and origin, subject to browser storage retention and quota. Saves fail visibly without replacing the last successful in-memory snapshot. A stale tab cannot overwrite changes made by another tab.

Data remains on this browser profile; this is not encrypted or account-protected storage. Nothing is sent to a server. Use a private browser profile on shared devices. Clearing site data removes the archive. Export important memories for backup; export is not an import/restore feature.

On the first visit only, existing scripted course characters, reflection transcripts, and linked project descriptions are copied into editable records. Original story files remain unchanged. Historical reflection dates are retained. Later edits or deletions do not modify scripted story conversations or their reflection dialogs, and deleted imported records are not regenerated on reload. Saved personality and instruction fields are reference information; no AI service processes them.

## Verification

Run `npm run build` for browser/server production compilation and SSR prerendering. Run `npm test -- --watch=false` for the application, persistence, validation, isolation, picture workflow, formatting, and destructive confirmation tests. Picture decoding and canvas encoding are mocked in unit tests; real image decoding and desktop/mobile visual inspection need a connected browser.

Professor customization also appears in the original story: open Subjects, select a course, then Professor > Edit Character / Upload Picture. Save the professor display name and portrait. Course choices and dialogue labels use that name; the character stage uses the saved picture. Course choices show professor names and course codes without room or lab numbers. Narrative lesson text and reflection transcripts retain their original content.

Generated chapters use flow version 2. Older generated chapters are updated once when played; saved subject notes, journals, and project links are preserved. Generated memory files are labeled story reflections and suggested activities, rather than actual submitted work.
