import { existsSync, writeFileSync } from 'node:fs';

if (process.argv.includes('--local-default')) {
  if (!existsSync('public/portfolio-config.js')) writeFileSync('public/portfolio-config.js', 'window.NOVEL_PORTFOLIO_CONFIG = null;\n');
  process.exit(0);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Vercel before building.');
if (new URL(url).protocol !== 'https:') throw new Error('SUPABASE_URL must use HTTPS.');
if (!(key.startsWith('sb_publishable_') || key.startsWith('eyJ'))) throw new Error('Use a Supabase publishable key or legacy anon key, never a secret/service-role key.');
if (key.startsWith('eyJ')) {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
  if (claims.role !== 'anon') throw new Error('The legacy key must have role anon, never service_role.');
}
writeFileSync('public/portfolio-config.js', `window.NOVEL_PORTFOLIO_CONFIG = ${JSON.stringify({ url, key }).replaceAll('<', '\\u003c')};\n`);
