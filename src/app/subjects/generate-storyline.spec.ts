import { ArchiveStore } from './archive-store';
import { generateStoryline } from './generate-storyline';
import { initialArchive } from './archive-store';

describe('Generated subject storylines', () => {
  it('upgrades older generated chapters once without changing subject memories', () => {
    localStorage.clear();
    const store = new ArchiveStore(); store.load();
    const source = store.data().subjects[0];
    store.saveSubject({ ...source, id: 'legacy-chapter', storyline: { ...generateStoryline(source), flowVersion: undefined } });
    const legacy = store.data().subjects.find(s => s.id === 'legacy-chapter')!;
    const memories = store.data().memories;
    const upgraded = store.prepareStoryline(legacy)!;
    expect(upgraded.storyline?.flowVersion).toBe(2);
    expect(upgraded.storyline?.entrySceneId).toContain('legacy-chapter');
    expect(store.data().memories).toEqual(memories);
    expect(store.prepareStoryline(upgraded)).toBe(upgraded);
    const reload = new ArchiveStore(); reload.load();
    expect(reload.data().subjects.find(s => s.id === legacy.id)?.storyline).toEqual(upgraded.storyline);
  });
  it('randomizes new chapters without changing their subject-specific scene IDs', () => {
    const subject = initialArchive().subjects[0];
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const first = generateStoryline(subject);
      random.mockReturnValue(0.99);
      const second = generateStoryline(subject);
      expect(first.entrySceneId).toBe(second.entrySceneId);
      expect(first.scenes[first.entrySceneId].lines).not.toEqual(second.scenes[second.entrySceneId].lines);
    } finally { random.mockRestore(); }
  });
  afterEach(() => localStorage.clear());
  it('generates a complete branching storyline personalized to the subject and professor', () => {
    const data = initialArchive();
    const subject = {
      ...data.subjects[0],
      id: 'new-math',
      name: 'Mathematics',
      code: 'MATH 101',
      description: 'Patterns in daily life',
    };
    const result = generateStoryline(subject, data.professors[0]);
    const scenes = Object.values(result.scenes);
    expect(result.scenes[result.entrySceneId]).toBeTruthy();
    expect(JSON.stringify(result)).toContain('Mathematics');
    expect(JSON.stringify(result)).toContain('Patterns in daily life');
    expect(scenes[0].character?.name).toBe(data.professors[0].displayName);
    expect(scenes.filter(s => s.reflection)).toHaveLength(3);
    expect(scenes.filter(s => s.reflection).every(s => s.next === result.entrySceneId)).toBe(true);
    const visited = new Set<string>();
    function visit(id: string) {
      if (id === 'subject-archive' || id === 'subject-hub' || visited.has(id)) return;
      const scene = result.scenes[id];
      expect(scene).toBeTruthy();
      visited.add(id);
      if (scene.next) visit(scene.next);
      for (const choice of scene.choices ?? []) visit(choice.next);
    }
    visit(result.entrySceneId);
    expect(visited.size).toBe(scenes.length);
    const another = generateStoryline({ ...subject, id: 'different-id', name: 'Physics' });
    expect(another.entrySceneId).not.toBe(result.entrySceneId);
    expect(JSON.stringify(another)).not.toContain('Mathematics');
  });
  it('saves new stories atomically, keeps them stable on edits and reloads, and deletes them with their subject', () => {
    localStorage.clear();
    const store = new ArchiveStore();
    store.load();
    const subject = { ...store.data().subjects[0], id: 'created-subject', name: 'New course' };
    const originalMemories = store.data().memories;
    expect(store.saveSubject(subject)).toBe(true);
    const saved = store.data().subjects.find((s) => s.id === subject.id)!;
    expect(saved.storyline?.entrySceneId).toBeTruthy();
    store.saveSubject({ ...subject, description: 'Edited later' });
    const reload = new ArchiveStore();
    reload.load();
    expect(reload.data().subjects.find((s) => s.id === subject.id)?.storyline).toEqual(
      saved.storyline,
    );
    expect(reload.data().memories).toEqual(originalMemories);
    reload.deleteSubject(subject.id);
    expect(JSON.stringify(reload.data())).not.toContain('subject-created-subject-arrival');
  });
});
