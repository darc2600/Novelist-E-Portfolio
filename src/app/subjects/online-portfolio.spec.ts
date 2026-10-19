import { OnlinePortfolio } from './online-portfolio';
import { ArchiveStore, initialArchive } from './archive-store';

describe('Shared online portfolio', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  const config = { url: 'https://example.supabase.co', key: 'public-key' };
  it('loads the same archive independently of browser storage', async () => {
    const data = initialArchive();
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ data, revision: 3 }])));
    vi.stubGlobal('fetch', request);
    const result = await new OnlinePortfolio(config).load();
    expect(result?.revision).toBe(3);
    expect(result?.data).toEqual(data);
    expect(request.mock.calls[0][0]).toContain('/rest/v1/portfolio_archive');
  });
  it('rejects stale saves and never reports network failure as success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]')));
    await expect(new OnlinePortfolio(config).save(initialArchive(), 2)).rejects.toThrow('changed');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('failure', { status: 503 })));
    await expect(new OnlinePortfolio(config).save(initialArchive(), 2)).rejects.toThrow('503');
  });
  it('uploads file bytes and downloads them for the embedded reader', async () => {
    const file = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
    const request = vi.fn().mockResolvedValueOnce(new Response('{}')).mockResolvedValueOnce({ ok: true, blob: async () => file });
    vi.stubGlobal('fetch', request);
    const online = new OnlinePortfolio(config);
    await online.upload('test-id', file);
    const result = await online.download('test-id');
    expect(result).toBe(file);
    expect(request.mock.calls[0][1].body).toBe(file);
  });
  it('changes shared state only after confirmation and preserves it after failure', async () => {
    vi.spyOn(OnlinePortfolio.prototype, 'enabled', 'get').mockReturnValue(true);
    const data = initialArchive();
    vi.spyOn(OnlinePortfolio.prototype, 'load').mockResolvedValue({ data, revision: 7 });
    const save = vi.spyOn(OnlinePortfolio.prototype, 'save').mockResolvedValue(8);
    const store = new ArchiveStore();
    await store.load();
    const changed = { ...data.subjects[0]!, name: 'Shared edit' };
    const saving = store.saveSubject(changed);
    expect(store.data()).toBe(data);
    expect(store.saving()).toBe(true);
    expect(await saving).toBe(true);
    expect(save.mock.calls[0]![1]).toBe(7);
    expect(store.data().subjects.find(s => s.id === changed.id)?.name).toBe('Shared edit');
    save.mockRejectedValue(new Error('Connection lost'));
    const previous = store.data();
    expect(await store.saveSubject({ ...changed, name: 'Unsaved' })).toBe(false);
    expect(store.data()).toBe(previous);
    expect(store.error()).toBe('Connection lost');
    expect(store.saving()).toBe(false);
  });
  it('does not use local browser data when online loading fails', async () => {
    vi.spyOn(OnlinePortfolio.prototype, 'enabled', 'get').mockReturnValue(true);
    vi.spyOn(OnlinePortfolio.prototype, 'load').mockRejectedValue(new Error('Offline'));
    const store = new ArchiveStore();
    await store.load();
    expect(store.ready()).toBe(false);
    expect(store.data().subjects).toHaveLength(0);
    expect(await store.commit(initialArchive())).toBe(false);
    expect(store.error()).toBe('Offline');
  });
});
