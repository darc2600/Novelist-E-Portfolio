import type { ArchiveData } from './models';

export interface OnlineConfig { url: string; key: string }
export interface OnlineArchive { data: ArchiveData; revision: number }

/** Only a public Supabase publishable/anon key belongs in this configuration. */
export class OnlinePortfolio {
  private readonly config: OnlineConfig | null;
  constructor(config?: OnlineConfig | null) {
    this.config = config === undefined
      ? (typeof window === 'undefined' ? null : (window as Window & { NOVEL_PORTFOLIO_CONFIG?: OnlineConfig | null }).NOVEL_PORTFOLIO_CONFIG ?? null)
      : config;
  }
  get enabled(): boolean { return this.config !== null; }
  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    if (!this.config) throw new Error('Online storage is not configured.');
    const response = await fetch(`${this.config.url.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: { apikey: this.config.key, ...init.headers },
      signal: AbortSignal.timeout(60000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Online storage request failed (${response.status}). Check your connection and project configuration, then try again.`);
    return response;
  }
  async load(): Promise<OnlineArchive | undefined> {
    const rows = await (await this.request('/rest/v1/portfolio_archive?id=eq.main&select=data,revision')).json() as OnlineArchive[];
    return rows[0];
  }
  async save(data: ArchiveData, revision: number): Promise<number> {
    const rows = await (await this.request('/rest/v1/rpc/save_portfolio', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archive: data, expected_revision: revision }),
    })).json() as { revision: number }[];
    if (!rows.length) throw new Error('The shared portfolio changed in another browser. Your draft is still open. Copy your draft, reload, and try again.');
    return rows[0]!.revision;
  }
  async upload(id: string, blob: Blob): Promise<void> {
    await this.request(`/storage/v1/object/portfolio-files/${encodeURIComponent(id)}`, {
      method: 'POST', headers: { 'Content-Type': blob.type }, body: blob,
    });
  }
  async download(id: string): Promise<Blob> {
    return (await this.request(`/storage/v1/object/portfolio-files/${encodeURIComponent(id)}`)).blob();
  }
  async remove(id: string): Promise<void> {
    await this.request(`/storage/v1/object/portfolio-files/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
