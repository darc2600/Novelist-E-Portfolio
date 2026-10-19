import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ArchiveStore } from './subjects/archive-store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  it('shows five subjects per hallway with different settings and keeps the selected hallway on return', () => {
    vi.useFakeTimers(); localStorage.clear();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    try {
      const store = TestBed.inject(ArchiveStore); store.load();
      const base = store.data().subjects[0];
      for (let i = 0; i < 8; i++) store.saveSubject({ ...base, id: `hall-course-${i}`, code: `EX ${i}`, name: `Extra course ${i}` });
      app['sceneId'].set('hub');
      const subjects = () => app['visibleChoices'].filter(c => !c.next.startsWith('hallway:') && c.next !== 'ending');
      expect(subjects()).toHaveLength(5);
      const first = subjects().map(c => c.next);
      const background = app['scene'].background;
      const next = app['visibleChoices'].find(c => c.next === 'hallway:1')!;
      expect(next).toBeTruthy(); app['choose'](next);
      // A cached corridor image can load before the scene transition completes.
      app['backgroundLoaded'](app['scene'].background);
      vi.advanceTimersByTime(500);
      expect(app['bgLoaded']()).toBe(true);
      expect(subjects()).toHaveLength(5);
      expect(subjects().some(c => first.includes(c.next))).toBe(false);
      const secondBackground = app['scene'].background;
      expect(secondBackground).not.toBe(background);
      expect(app['locationTitle']()).toContain('HALLWAY 2');
      const subjectChoice = subjects()[0];
      app['choose'](subjectChoice); vi.advanceTimersByTime(500);
      app['choose']({ label: 'Return', next: 'subject-hub' }); vi.advanceTimersByTime(500);
      expect(subjects()[0].next).toBe(subjectChoice.next);
      expect(app['scene'].background).toBe(secondBackground);
      app['choose'](app['visibleChoices'].find(c => c.next === 'hallway:2')!); vi.advanceTimersByTime(500);
      expect(subjects()).toHaveLength(2);
      expect(app['scene'].background).not.toBe(secondBackground);
      expect(app['visibleChoices'].some(c => c.next === 'hallway:3')).toBe(false);
      app['choose'](app['visibleChoices'].find(c => c.next === 'hallway:1')!); vi.advanceTimersByTime(500);
      expect(subjects()).toHaveLength(5);
    } finally { fixture.destroy(); vi.useRealTimers(); localStorage.clear(); }
  });
  it('browses real projects, notes, and journals scoped to the selected professor subject', () => {
    vi.useFakeTimers(); localStorage.clear();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    try {
      const store = TestBed.inject(ArchiveStore); store.load();
      const subject = store.data().subjects.find(s => s.code === 'DES 301')!;
      const other = store.data().subjects.find(s => s.code === 'CS 284')!;
      const base = store.data().memories[0];
      for (const type of ['project', 'note', 'journal'] as const) {
        for (const s of [subject, other]) store.saveMemory({ ...base, id: `${s.id}-${type}-actual`, subjectId: s.id,
          type, title: `${s.code} saved ${type}`, content: `${s.code} actual ${type} content`, url: type === 'project' ? 'https://example.com/my-project' : '',
          attachments: type === 'project' ? [] : [{ id: `${s.id}-${type}-pdf`, name: 'lesson.pdf', mimeType: 'application/pdf', size: 100 }] });
        app['choose']({ label: 'Professor', next: 'uxd_intro' }); vi.advanceTimersByTime(500);
        const background = app['scene'].background;
        expect(app['visibleChoices'].map(c => c.label)).toEqual(expect.arrayContaining(['Projects & Links', 'Notes', 'Journal']));
        expect(app['visibleChoices'].some(c => c.next === 'browse-memories')).toBe(false);
        app['choose']({ label: type, next: `browse-memories:${type}` }); vi.advanceTimersByTime(500);
        expect(app['scene'].lines[0].text).toContain('Which one would you like to open?');
        expect(app['pastAllLines']).toBe(false);
        app['advanceDialogue'](); app['advanceDialogue']();
        expect(app['pastAllLines']).toBe(true);
        expect(app['visibleChoices'].some(c => c.label.includes('CS 284'))).toBe(false);
        const entry = app['visibleChoices'].find(c => c.label === `DES 301 saved ${type}`)!;
        app['choose'](entry); vi.advanceTimersByTime(1000);
        expect(app['reflection']?.memoryKind).toBe(type);
        if (type !== 'project') expect(app['reflection']?.attachments?.[0].id).toBe(`${subject.id}-${type}-pdf`);
        expect(app['reflection']?.body.join('\n')).toBe(`DES 301 actual ${type} content`);
        expect(app['reflection']?.project.link).toBe(type === 'project' ? 'https://example.com/my-project' : undefined);
        expect(app['scene'].background).toBe(background);
        expect(app['showReflection']()).toBe(true);
        app['dismissReflection'](); vi.advanceTimersByTime(400);
        app['continueScene'](); vi.advanceTimersByTime(500);
        expect(app['sceneId']()).toBe(`memory-list-${type}`);
      }
      app['choose']({ label: 'Other professor', next: 'webdev_intro' }); vi.advanceTimersByTime(500);
      app['choose']({ label: 'Memories', next: 'browse-memories' }); vi.advanceTimersByTime(500);
      app['choose']({ label: 'Notes', next: 'memory-list-note' }); vi.advanceTimersByTime(500);
      expect(app['visibleChoices'].some(c => c.label.includes('DES 301'))).toBe(false);
      expect(app['visibleChoices'].some(c => c.label.includes('CS 284 saved note'))).toBe(true);
    } finally { fixture.destroy(); vi.useRealTimers(); localStorage.clear(); }
  });
  it('keeps a loaded background visible across lessons in the same professor setting', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    try {
      app['choose']({ label: 'Design', next: 'uxd_intro' });
      vi.advanceTimersByTime(500);
      app['backgroundLoaded'](app['scene'].background);
      const background = app['scene'].background;
      app['choose']({ label: 'Lesson', next: 'uxd_r1' });
      vi.advanceTimersByTime(500);
      expect(app['scene'].background).toBe(background);
      expect(app['bgLoaded']()).toBe(true);
      app['choose']({ label: 'Other professor', next: 'webdev_intro' });
      vi.advanceTimersByTime(500);
      expect(app['scene'].background).not.toBe(background);
      expect(app['bgLoaded']()).toBe(false);
    } finally { fixture.destroy(); vi.useRealTimers(); }
  });
  it('uses actual saved course and professor totals in narration and the title', () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const store = TestBed.inject(ArchiveStore); store.load();
    const original = store.data().subjects[0];
    store.saveSubject({ ...original, id: 'extra-course', code: 'EX 101' }, 'New Professor');
    app['sceneId'].set('intro');
    expect(app['scene'].lines[2].text).toContain('5 courses. 5 professors.');
    store.saveSubject({ ...original, id: 'shared-professor-course' }, 'New Professor');
    expect(app['scene'].lines[2].text).toContain('6 courses. 5 professors.');
    store.deleteSubject('extra-course');
    expect(app['scene'].lines[2].text).toContain('5 courses. 5 professors.');
    app['sceneId'].set('title'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.title-mark span').textContent).toBe('05');
    store.commit({ ...store.data(), subjects: [original], professors: [store.data().professors[0]] });
    app['sceneId'].set('intro');
    expect(app['scene'].lines[2].text).toContain('1 course. 1 professor.');
    fixture.destroy(); localStorage.clear();
  });
  it('lists saved custom subjects in hub choices and plays their generated routes', () => {
    vi.useFakeTimers(); localStorage.clear();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    try {
      const store = TestBed.inject(ArchiveStore); store.load();
      store.saveSubject({ ...store.data().subjects[0], id: 'new-subject', name: 'Creative Writing', code: 'ENG 101' }, 'Professor Lee');
      app['sceneId'].set('hub');
      const choice = app['visibleChoices'].find(c => c.label.includes('ENG 101'))!;
      expect(choice.label).toContain('Professor Lee');
      expect(app['routeIndicators'].some(r => r.label === 'ENG 101')).toBe(true);
      app['choose'](choice); vi.advanceTimersByTime(500);
      const saved = store.data().subjects.find(s => s.id === 'new-subject')!;
      expect(app['scene'].id).toBe(saved.storyline!.entrySceneId);
      app['choose'](app['scene'].choices![0]); vi.advanceTimersByTime(500);
      app['continueScene'](); vi.advanceTimersByTime(500);
      app['choose'](app['scene'].choices![0]); vi.advanceTimersByTime(500);
      app['continueScene'](); vi.advanceTimersByTime(500);
      const back = app['scene'].choices!.find(c => c.next === 'subject-hub')!;
      expect(back).toBeTruthy(); app['choose'](back); vi.advanceTimersByTime(500);
      expect(app['sceneId']()).toBe('hub');
      expect(app['flags']()['visited_subject_new-subject']).toBe(true);
      const reload = new ArchiveStore(); reload.load();
      expect(reload.data().subjects.find(s => s.id === saved.id)?.storyline).toEqual(saved.storyline);
      store.saveSubject({ ...saved, isArchived: true });
      expect(app['visibleChoices'].some(c => c.label.includes('ENG 101'))).toBe(false);
    } finally { fixture.destroy(); vi.useRealTimers(); localStorage.clear(); }
  });

  it('uses saved professor names and pictures in original story dialogue and course choices', () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const store = TestBed.inject(ArchiveStore); store.load();
    const professor = store.data().professors.find(p => p.id === 'professor-DES 301')!;
    store.saveProfessor({ ...professor, displayName: 'Professor Jill', pictureUrl: 'data:image/webp;base64,test', picturePosition: 25 });
    app['sceneId'].set('hub');
    expect(app['visibleChoices'][0].label).toBe('Professor Jill · DES 301');
    expect(app['visibleChoices'].some(c => /Room \d|Lab \d/.test(c.label))).toBe(false);
    app['sceneId'].set('uxd_intro');
    expect(app['scene'].character?.name).toBe('Professor Jill');
    expect(app['scene'].character?.pictureUrl).toContain('base64,test');
    expect(app['scene'].lines.find(l => l.character)?.character?.name).toBe('Professor Jill');
    expect(app['visibleChoices'].find(c => c.next === 'hub')?.label).toContain('Professor Jill');
    expect(app['visibleChoices'].find(c => c.next === 'hub')?.label).not.toContain('Prof. Torres');
    store.saveProfessor({ ...professor, displayName: 'Dr. Pascua' });
    expect(app['visibleChoices'].find(c => c.next === 'hub')?.label).toContain('Dr. Pascua');
    app['sceneId'].set('uxd_r1');
    expect(app['reflection']?.body.join(' ')).toContain('Dr. Pascua introduced');
    expect(app['reflection']?.body.join(' ')).not.toContain('Prof. Torres');
    fixture.destroy(); localStorage.clear();
  });

  it('shows the saved portfolio name on the start page', async () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(App);
    const store = TestBed.inject(ArchiveStore);
    store.load();
    store.savePortfolioName('Sample Name');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.title-meta')?.textContent)
      .toContain('Sample Name - Portfolio Website');
    localStorage.clear();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('REFLECTION');
  });

  it('plays generated subject branches in the story engine and returns to their dashboard', () => {
    vi.useFakeTimers();
    localStorage.clear();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    try {
      const store = TestBed.inject(ArchiveStore);
      store.load();
      store.saveSubject({ ...store.data().subjects[0], id: 'playable', name: 'New subject' });
      const subject = store.data().subjects.find((s) => s.id === 'playable')!;
      app['playSubject'](subject);
      vi.advanceTimersByTime(500);
      expect(app['scene'].id).toBe(subject.storyline!.entrySceneId);
      app['choose'](app['scene'].choices![0]);
      vi.advanceTimersByTime(500);
      expect(app['scene'].id).toContain('investigate');
      vi.advanceTimersByTime(500);
      expect(app['showReflection']()).toBe(true);
      expect(app['reflection']?.courseCode).toBe(subject.code);
      app['dismissReflection'](); vi.advanceTimersByTime(400);
      app['continueScene']();
      vi.advanceTimersByTime(500);
      app['choose'](app['scene'].choices![2]);
      vi.advanceTimersByTime(500);
      expect(app['scene'].id).toContain('feedback');
      app['continueScene']();
      vi.advanceTimersByTime(500);
      expect(app['visibleChoices'].some(c => c.next === 'subject-archive')).toBe(false);
      app['choose'](app['scene'].choices!.find(c => c.next === 'subject-hub')!);
      vi.advanceTimersByTime(500);
      expect(app['showSubjects']()).toBe(false);
      expect(app['activeSubjectId']()).toBe(subject.id);
      expect(app['scene'].id).toBe('hub');
    } finally {
      fixture.destroy();
      vi.useRealTimers();
      localStorage.clear();
    }
  });
});
