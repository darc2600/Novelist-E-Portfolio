# Novel E-Portfolio: online version design

Status: revised to reflect the approved shared-editing approach. Implemented locally; no cloud resources have been created or connected.

## Intended result

The portfolio editor and anyone else with the shared link can upload and edit the same portfolio. A professor opens its Vercel URL on another device and sees the same saved subjects, professor pictures, projects, notes, journals, generated stories, and attachments. Closing the browser does not remove the online copy.

The current branch is `alternate-online-version`. GitHub pushes and publishing are performed by the user, not the coding assistant.

## Proposed services

- Vercel hosts the Angular website, built for the domain root rather than the GitHub Pages repository subpath.
- Supabase project and organization name: `Novel E-Portfolio`.
- Supabase Postgres stores the archive and a revision number, retaining existing record IDs and generated storylines.
- Supabase Storage stores note/journal PDF/image attachments. Resized professor pictures remain in the database archive. Existing PDF.js rendering continues to load file bytes for previews.
- No accounts or login: everyone with the link can view and edit, as explicitly requested.

Supabase provides database and file storage. Vercel hosting alone does not replace the browser stores.

## Access rules

The shared archive is intentionally readable and editable through the public API. Dedicated anonymous-role policies allow access only to this archive and its file bucket. Revision checks prevent accidental stale overwrites. No privileged credentials are included in the browser. `noindex` discourages indexing but is not privacy or access protection.

## Save behavior

Replace synchronous browser writes with awaited online requests. Display loading, saving, saved, and failed states. Only close an editor after a confirmed save. Use revision checks to reject stale writes from another tab rather than overwrite newer content.

Load the same online archive for all viewers. Do not silently fall back to unrelated local content on a network error. Browsing and public story playback must not generate writes: required generated scenes are prepared by the owner and saved with the archive.

For uploads, validate existing file types and limits, upload bytes, then save the record reference. If record saving fails, preserve the editor and offer retry; clean up orphan uploads safely. Deleting a record must not first destroy files still referenced by saved content. Keep original file names as metadata and use unique storage keys.

## Existing browser data

Automatic migration/import is not implemented. Existing local data is left intact. Re-enter existing content and upload original files in the deployed online site. Existing text exports contain metadata, not attachment bytes. The Vercel origin cannot read localhost or GitHub Pages browser storage.

## Deployment and configuration

Provide a separate root-path static build for Vercel and retain the GitHub Pages build. Supply SQL setup and access policies, a documented public configuration template, and user-run Vercel setup instructions. Do not commit credentials or deploy automatically.

README documentation must distinguish this online branch from the local-storage version. Document public visibility, connectivity requirements, service quotas, backups, public editing, and failure/retry behavior.

## Verification

- Editors can save and reopen subjects, names, pictures, notes, journals, and attachments.
- A separate browser sees the same saved content and previews without logging in.
- Everyone with the link can edit or delete shared records and files; this is intentional.
- Story playback by visitors makes no database writes.
- Failed uploads, save failures, and stale revisions preserve the editor and report errors.
- Existing archive/story/PDF tests pass; root-path Vercel build includes backgrounds and PDF worker assets.
- Real cloud checks require the user's configured Supabase project.

## User setup remaining

Create the dedicated Vercel and Supabase projects and follow [VERCEL-SETUP.md](VERCEL-SETUP.md). Configure the project URL and publishable key. Do not post privileged secrets or passwords in chat. Push and publish only through the user's own actions.
