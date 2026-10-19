import { ARCHIVE_KEY, ArchiveStore, initialArchive } from './archive-store';
import { story } from '../story/story';

describe('Subject archive persistence', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });
  it('copies every reflection once, preserving dates and the original story', () => {
    const original = JSON.stringify(story);
    const store = new ArchiveStore();
    store.load();
    const reflections = Object.values(story).filter((s) => s.reflection);
    expect(store.data().subjects).toHaveLength(4);
    expect(store.data().memories.filter((m) => m.type === 'journal')).toHaveLength(
      reflections.length,
    );
    expect(store.data().memories.every((m) => !!m.date)).toBe(true);
    const reloaded = new ArchiveStore();
    reloaded.load();
    expect(reloaded.data()).toEqual(store.data());
    expect(JSON.stringify(story)).toBe(original);
  });
  it('persists subject edits, archive state, reusable professors and pictures', () => {
    const store = new ArchiveStore();
    store.load();
    const subject = { ...store.data().subjects[0], name: 'Edited subject', isArchived: true };
    expect(store.saveSubject(subject)).toBe(true);
    const professor = {
      ...store.data().professors[0],
      pictureUrl: 'data:image/webp;base64,dGVzdA==',
    };
    expect(store.saveProfessor(professor)).toBe(true);
    expect(
      store.saveSubject({ ...store.data().subjects[1], professorCharacterId: professor.id }),
    ).toBe(true);
    const reloaded = new ArchiveStore();
    reloaded.load();
    expect(reloaded.data().subjects.find((s) => s.id === subject.id)).toMatchObject(subject);
    expect(
      reloaded.data().subjects.filter((s) => s.professorCharacterId === professor.id),
    ).toHaveLength(2);
    expect(
      reloaded.data().professors[0].pictureUrl ||
        reloaded.data().professors.find((p) => p.id === professor.id)?.pictureUrl,
    ).toBe(professor.pictureUrl);
    expect(reloaded.saveProfessor({ ...professor, pictureUrl: '' })).toBe(true);
    const removed = new ArchiveStore();
    removed.load();
    expect(removed.data().professors.find((p) => p.id === professor.id)?.pictureUrl).toBe('');
  });
  it('updates notes and journals without duplication and deletes only the selected subject memories', () => {
    const store = new ArchiveStore();
    store.load();
    const a = store.data().subjects[0];
    const b = store.data().subjects[1];
    const bMemories = store.data().memories.filter((m) => m.subjectId === b.id);
    const source = store.data().memories.find((m) => m.subjectId === a.id)!;
    const note = {
      ...source,
      id: 'new-note',
      type: 'note' as const,
      content: '# Heading\n- Point',
      isPinned: true,
    };
    store.saveMemory(note);
    store.saveMemory({ ...note, title: 'Edited note' });
    expect(store.data().memories.filter((m) => m.id === note.id)).toHaveLength(1);
    const reload = new ArchiveStore();
    reload.load();
    expect(reload.data().memories.find((m) => m.id === note.id)?.title).toBe('Edited note');
    expect(reload.saveMemory({ ...note, subjectId: 'missing' })).toBe(false);
    reload.deleteSubject(a.id);
    expect(reload.data().memories.some((m) => m.subjectId === a.id)).toBe(false);
    expect(reload.data().memories.filter((m) => m.subjectId === b.id)).toEqual(bMemories);
  });
  it('preserves malformed archives and reports storage failures without claiming a save', () => {
    localStorage.setItem(ARCHIVE_KEY, '{broken');
    const store = new ArchiveStore();
    store.load();
    expect(store.error()).toBeTruthy();
    expect(store.commit(initialArchive())).toBe(false);
    expect(localStorage.getItem(ARCHIVE_KEY)).toBe('{broken');
    localStorage.clear();
    const working = new ArchiveStore();
    working.load();
    const previous = working.data();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota');
    });
    expect(working.saveSubject({ ...previous.subjects[0], name: 'Unsaved' })).toBe(false);
    expect(working.data()).toBe(previous);
    expect(working.error()).toContain('Save failed');
  });
  it('refuses to overwrite newer changes from another tab', () => {
    const first = new ArchiveStore();
    first.load();
    const second = new ArchiveStore();
    second.load();
    first.saveSubject({ ...first.data().subjects[0], name: 'Newer edit' });
    expect(second.saveSubject({ ...second.data().subjects[0], name: 'Stale edit' })).toBe(false);
    expect(second.error()).toContain('another tab');
  });
});
