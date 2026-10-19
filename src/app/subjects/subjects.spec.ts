import { TestBed } from '@angular/core/testing';
import { Subjects } from './subjects';
import { ArchiveStore } from './archive-store';
import { AttachmentStore } from './attachment-store';

describe('Subject dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom does not implement the native dialog API.
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
    TestBed.configureTestingModule({ imports: [Subjects] });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });
  function setup() {
    const fixture = TestBed.createComponent(Subjects);
    const page = fixture.componentInstance;
    const store = TestBed.inject(ArchiveStore);
    store.load();
    page.open(store.data().subjects[0]);
    return { fixture, page, store };
  }
  it('saves note and journal attachment metadata, preserves it on reload, and discards cancelled uploads', async () => {
    const { page, store } = setup();
    const attachmentStore = TestBed.inject(AttachmentStore);
    const add = vi.spyOn(attachmentStore, 'add');
    const remove = vi.spyOn(attachmentStore, 'remove').mockResolvedValue();
    for (const type of ['note', 'journal'] as const) {
      const attachment = { id: `${type}-pdf`, name: 'lesson.pdf', mimeType: 'application/pdf', size: 100 };
      add.mockResolvedValueOnce(attachment);
      page.editMemory(type); page.memoryDraft!.title = `Attached ${type}`;
      await page.uploadAttachments({ target: { files: [new File(['%PDF-1.7'], 'lesson.pdf', { type: 'application/pdf' })], value: '' } } as unknown as Event);
      const id = page.memoryDraft!.id;
      expect(page.memoryDraft!.attachments).toEqual([attachment]);
      await page.save();
      const reload = new ArchiveStore(); reload.load();
      expect(reload.data().memories.find(m => m.id === id)?.attachments).toEqual([attachment]);
      expect(remove).not.toHaveBeenCalledWith(attachment.id);
      page.editMemory(type, store.data().memories.find(m => m.id === id)!);
      page.removeAttachment(attachment.id); page.cancel();
      expect(store.data().memories.find(m => m.id === id)?.attachments).toEqual([attachment]);
    }
    page.editMemory('note');
    add.mockResolvedValueOnce({ id: 'cancelled-upload', name: 'image.png', mimeType: 'image/png', size: 20 });
    await page.uploadAttachments({ target: { files: [new File(['png'], 'image.png')], value: '' } } as unknown as Event);
    page.cancel(); expect(remove).toHaveBeenCalledWith('cancelled-upload');
  });
  it('updates both picture previews while dragging the vertical position slider', async () => {
    const { fixture, page, store } = setup();
    fixture.detectChanges();
    page.editProfessor({ ...store.data().professors[0], pictureUrl: 'data:image/webp;base64,preview' });
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const slider = el.querySelector('input[name="position"]') as HTMLInputElement;
    slider.value = '15';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(page.professorDraft!.picturePosition).toBe(15);
    const previews = el.querySelectorAll('.picture-previews img') as NodeListOf<HTMLImageElement>;
    expect(previews).toHaveLength(2);
    for (const preview of previews) expect(preview.style.objectPosition).toBe('50% 15%');
    expect(store.data().professors[0].picturePosition).toBe(50);
  });
  it('renders dashboard-only cards and a typable professor name in Add Subject', async () => {
    const { fixture, page } = setup();
    page.selectedId = '';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.subject-card .card-actions')).toHaveLength(0);
    expect(Array.from(el.querySelectorAll('.subject-card button')).some(b => b.textContent?.trim() === 'Edit')).toBe(false);
    expect(el.querySelector('.dashboard-link')?.textContent).toContain('Open dashboard');
    const add = Array.from(el.querySelectorAll('button')).find(b => b.textContent?.trim() === '+ Add Subject')!;
    add.click(); fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('dialog select[name="professor"]')).toBeNull();
    const professor = el.querySelector('dialog input[name="professor"]') as HTMLInputElement;
    expect(professor).toBeTruthy();
    professor.value = 'Professor Santos';
    professor.dispatchEvent(new Event('input', { bubbles: true }));
    expect(page.subjectProfessorName).toBe('Professor Santos');
  });
  it('creates a subject and scopes search, date filters and notes to its dashboard', async () => {
    const { page, store } = setup();
    page.editSubject();
    page.subjectDraft!.name = 'New course';
    page.subjectDraft!.code = 'NEW 101';
    page.subjectProfessorName = 'Professor Rivera';
    await page.save();
    const subject = store.data().subjects.find((s) => s.code === 'NEW 101')!;
    expect(store.data().professors.find(p => p.id === subject.professorCharacterId)?.displayName).toBe('Professor Rivera');
    expect(JSON.stringify(subject.storyline)).toContain('Professor Rivera');
    page.open(subject);
    page.setTab('Notes');
    page.editMemory('note');
    page.memoryDraft!.title = 'Important';
    page.memoryDraft!.content = '# Lesson\n- Remember';
    await page.save();
    expect(page.memories).toHaveLength(1);
    page.memoryQuery = 'missing';
    expect(page.memories).toHaveLength(0);
    page.setTab('Journal');
    page.editMemory('journal');
    page.memoryDraft!.title = 'Reflection';
    await page.save();
    expect(page.memories).toHaveLength(1);
    page.dateFilter = '1900-01-01';
    expect(page.memories).toHaveLength(0);
    page.open(store.data().subjects.find((s) => s.id !== subject.id)!);
    page.setTab('Notes');
    expect(page.memories).toHaveLength(0);
  });
  it('rejects unsafe URLs and unsupported or oversized pictures', async () => {
    const { page, store } = setup();
    const before = store.data().memories.length;
    page.editMemory('project');
    page.memoryDraft!.title = 'Bad';
    page.memoryDraft!.url = 'javascript:alert(1)';
    await page.save();
    expect(page.error).toContain('HTTP');
    expect(store.data().memories).toHaveLength(before);
    page.cancel();
    page.editProfessor();
    await page.upload({
      target: {
        files: [new File(['bad'], 'bad.svg', { type: 'image/svg+xml' })],
        value: 'bad.svg',
      },
    } as unknown as Event);
    expect(page.error).toContain('5 MB');
    expect(page.professorDraft!.pictureUrl).toBe('');
    await page.upload({
      target: {
        files: [
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }),
        ],
        value: 'large.png',
      },
    } as unknown as Event);
    expect(page.error).toContain('5 MB');
  });
  it('decodes valid uploads, persists their preview, and supports replacement and removal', async () => {
    const { page, store } = setup();
    page.editProfessor(store.data().professors[0]);
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 1200, height: 800, close: vi.fn() }),
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    const convert = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/webp;base64,first');
    const upload = () =>
      page.upload({
        target: {
          files: [new File(['image'], 'portrait.jpg', { type: 'image/jpeg' })],
          value: 'portrait.jpg',
        },
      } as unknown as Event);
    await upload();
    expect(page.professorDraft!.pictureUrl).toContain('first');
    await page.save();
    const reload = new ArchiveStore();
    reload.load();
    expect(reload.data().professors.find((p) => p.id === page.professor!.id)?.pictureUrl).toContain(
      'first',
    );
    page.editProfessor(page.professor);
    convert.mockReturnValue('data:image/webp;base64,replacement');
    await upload();
    expect(page.professorDraft!.pictureUrl).toContain('replacement');
    page.removePicture();
    expect(page.professorDraft!.pictureUrl).toBe('');
    await page.save();
    expect(page.professor!.pictureUrl).toBe('');
    vi.unstubAllGlobals();
  });
  it('requires confirmation for destructive changes', async () => {
    const { page, store } = setup();
    const subject = page.subject!;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await page.deleteSubject(subject);
    expect(page.subject).toBeTruthy();
    confirmSpy.mockReturnValue(true);
    await page.deleteSubject(subject);
    expect(store.data().subjects.some((s) => s.id === subject.id)).toBe(false);
  });

  it('opens the dashboard from a subject card and isolates every category and overview count', async () => {
    const { fixture, page, store } = setup();
    const [first, second] = store.data().subjects;
    const template = store.data().memories[0];
    for (const subject of [first, second]) {
      for (const type of ['project', 'note', 'journal'] as const) {
        store.saveMemory({ ...template, id: `${subject.id}-${type}`, subjectId: subject.id, type,
          title: `${subject.code} ${type}`, content: `${subject.code} exclusive content` });
      }
    }
    page.selectedId = ''; fixture.detectChanges();
    const card = fixture.nativeElement.querySelector(`[aria-label="Open ${first.name} dashboard"]`) as HTMLButtonElement;
    card.click(); fixture.detectChanges();
    expect(page.subject?.id).toBe(first.id);
    expect(page.tab).toBe('Overview');
    for (const tab of ['Projects & Links', 'Notes', 'Journal', 'Memory']) {
      const tabButton = Array.from(fixture.nativeElement.querySelectorAll('.tabs button') as NodeListOf<HTMLButtonElement>)
        .find(button => button.textContent?.trim() === tab)!;
      tabButton.click();
      fixture.detectChanges();
      expect(page.memories.length).toBeGreaterThan(0);
      expect(page.memories.every(m => m.subjectId === first.id)).toBe(true);
      expect(page.memoryCount(tab)).toBe(page.memories.length);
      expect(fixture.nativeElement.textContent).not.toContain(`${second.code} exclusive content`);
    }
    page.open(second); page.setTab('Memory');
    expect(page.memories.every(m => m.subjectId === second.id)).toBe(true);
    page.selectedId = '';
    expect(page.subjectMemories).toEqual([]);
  });
  it('renders note formatting as text, including untrusted HTML', async () => {
    const { fixture, page } = setup();
    page.setTab('Notes');
    page.editMemory('note');
    page.memoryDraft!.title = '<script>alert(1)</script>';
    page.memoryDraft!.content = '# Heading\n- <img src=x onerror=alert(1)>';
    await page.save();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.memory h3')?.textContent).toBe('Heading');
    expect(el.querySelector('.note-content img')).toBeNull();
    expect(el.querySelector('.list-line')?.textContent).toContain('<img');
  });
});
