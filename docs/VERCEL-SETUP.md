# Publish the shared online version

## Current setup

- Live website: **https://novel-e-portfolio.vercel.app/**
- Vercel project: `novel-e-portfolio` (deployed directly from local source, without a GitHub push).
- Supabase project: **Novel E-Portfolio**, in the existing **Rico J** workspace, Singapore region.
- Database API: `https://ytauuditpqaodrgdvgec.supabase.co`.
- Shared archive and file storage are configured. A separate API client verified archive reads, stale-save protection, and temporary PDF upload/download/deletion.
- GitHub still does not contain these uncommitted branch changes. Only the user may push them. Future Vercel updates must be deployed separately unless the user connects Git deployment.

The instructions below also describe how to recreate this setup.

Supabase's advisor reports that anonymous visitors can execute the save function. This is intentional for the approved no-login editing model; direct table writes remain restricted and the function checks revisions. See [the public-function advisory](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable). Changing to owner-only editing requires changing this access model, not just hiding buttons.

This branch keeps the existing editing controls and uses one shared online archive. Everyone with the link can view, add, change, or delete content. There are no accounts. Search-engine `noindex` requests are included, but do not make the site private. Use a dedicated project and keep backups.

## 1. Create online storage

1. Create a Supabase organization and project named **Novel E-Portfolio**. The organization is a workspace; it does not require a registered company.
2. In its SQL Editor, run [supabase/setup.sql](../supabase/setup.sql). It creates the archive, revision-checked save function, file bucket, and intentionally open access rules.
3. Copy the **Project URL** and **publishable key** from project settings. A legacy `anon` key is also supported. Never use a secret key, `service_role` key, database password, or connection string in this website.

Supabase provides the persistent database and file storage. Vercel alone does not store form edits or uploads. Review the provider's storage/traffic quotas and project availability before sharing.

## 2. Push the branch yourself

Review the changed files first, then run from the NovelPortfolio directory:

```powershell
git status
git add .
git commit -m "Add shared online portfolio and Vercel setup"
git push -u origin alternate-online-version
```

Do not merge this branch into `main` unless you also want to change the local-storage version on GitHub Pages. Do not commit generated online configuration, credentials, or unrelated files; review `git diff --cached` before committing.

## 3. Import into Vercel

1. Add a new Vercel project by importing your GitHub repository. Name it **novel-e-portfolio**.
2. Set its **Production Branch** to `alternate-online-version` in Git settings. Make sure the first deployment uses that branch, not `main`.
3. The repository root is already the Angular project: use `.` as the Root Directory.
4. Build Command: `npm run build:vercel`. Output Directory: `dist/NovelPortfolio/browser`. Node.js: `22.x`. Install Command: `npm ci`.
5. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` environment variables. Set them for Production and any Preview environment you want connected to the SAME shared archive. Preview edits will affect production data if both use the same Supabase project.
6. Deploy. `vercel.json` supplies the build/output settings and noindex header. The build refuses missing online settings instead of accidentally publishing a local-only version.
7. If the professor should access the site without a Vercel login, check Deployment Protection for the URL you share. Share the stable production URL.

## 4. Add content and verify it

Open the Vercel site and add a subject, note, PDF, and professor picture. Wait for **Saved online**. Open the same URL in another browser/device and confirm the saved content and attachments appear. Reload to pick up edits made in another browser. If a stale save is rejected, copy your draft before reloading.

Online saving does not silently fall back to browser storage during an outage. Failed saves keep the editor open. If an upload succeeds but the archive save fails, retry the save while the editor is still open. Closing the editor removes its unsaved uploads when possible. Interrupted sessions can leave unused files in the bucket; inspect references before deleting any files manually.

## Existing local content and backups

The online site starts with the bundled starter content. It does **not** automatically upload existing localStorage/IndexedDB content. Your localhost/GitHub Pages browser data remains intact, but Vercel cannot read another origin's browser storage. Re-enter existing entries and upload their original files on the online site. JSON/Markdown exports contain text/metadata only, not file bytes, and automatic import/restore is not implemented.

Professor pictures remain resized data URLs in the database archive. Note/journal file bytes are in the storage bucket; downloads still use the embedded PDF/image previews. Keep copies of original uploads, export text regularly, and use provider backups for the online archive. Public editing and deletion apply across every device.

## Local development

`npm start` defaults to the original browser-only storage. To test the shared online service locally:

```powershell
$env:SUPABASE_URL = "https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YOUR_KEY"
node scripts/configure-online.mjs
npm start
```

`public/portfolio-config.js` is generated, ignored by Git, and contains only public settings. Delete this generated file to return to browser storage; the Angular build supplies its default local configuration. Restart the development server after changing configuration. Do not test destructive edits against the shared production archive unless intended.
