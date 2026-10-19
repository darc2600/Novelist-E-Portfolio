import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ArchiveStore } from './archive-store';
import { MemoryType, ProfessorCharacter, Subject, SubjectMemory } from './models';
import { AttachmentStore } from './attachment-store';
import { AttachmentPreview } from './attachment-preview';

@Component({
  selector: 'app-subjects',
  imports: [FormsModule, DatePipe, AttachmentPreview],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class Subjects {
  readonly initialSubjectId = input('');
  readonly startWithNewSubject = input(false);
  readonly close = output<void>();
  readonly playStory = output<Subject>();
  readonly store = inject(ArchiveStore);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly attachmentStore = inject(AttachmentStore);
  private readonly newAttachmentIds = new Set<string>();
  private readonly removedAttachmentIds = new Set<string>();
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editor');
  selectedId = '';
  tab = 'Overview';
  query = '';
  status = 'active';
  memoryQuery = '';
  dateFilter = '';
  readonly tabs = ['Overview', 'Professor', 'Projects & Links', 'Notes', 'Journal', 'Memory'];
  subjectDraft: Subject | null = null;
  subjectProfessorName = '';
  professorDraft: ProfessorCharacter | null = null;
  memoryDraft: SubjectMemory | null = null;
  tags = '';
  error = '';
  notice = '';
  portfolioName: string | null = null;
  savePortfolioName() {
    const name = this.portfolioName ?? this.store.data().portfolioName ?? 'Jillian Pascua';
    if (this.store.savePortfolioName(name)) {
      this.portfolioName = null;
      this.notice = 'Portfolio name saved on this browser.';
    }
  }
  uploading = false;
  private uploadSequence = 0;
  constructor() {
    afterNextRender(() => {
      if (!this.store.ready()) this.store.load();
      if (this.startWithNewSubject()) {
        this.editSubject();
        this.changeDetector.markForCheck();
      }
    });
  }
  ngOnInit() {
    if (this.initialSubjectId()) this.selectedId = this.initialSubjectId();
  }
  get subject() {
    return this.store.data().subjects.find((s) => s.id === this.selectedId);
  }
  get professor() {
    return this.professorFor(this.subject);
  }
  professorFor(subject?: Subject) {
    return this.store.data().professors.find((p) => p.id === subject?.professorCharacterId);
  }
  get subjects() {
    return this.store
      .data()
      .subjects.filter(
        (s) =>
          (this.status === 'all' || s.isArchived === (this.status === 'archived')) &&
          `${s.name} ${s.code} ${s.semester}`.toLowerCase().includes(this.query.toLowerCase()),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  get subjectMemories() {
    if (!this.subject) return [];
    return this.store.data().memories.filter(m => m.subjectId === this.subject!.id);
  }
  memoryCount(tab: string) {
    const type = tab === 'Notes' ? 'note' : tab === 'Journal' ? 'journal' : tab === 'Projects & Links' ? 'project' : '';
    return this.subjectMemories.filter(m => !type || m.type === type).length;
  }
  get memories() {
    const type =
      this.tab === 'Notes'
        ? 'note'
        : this.tab === 'Journal'
          ? 'journal'
          : this.tab === 'Projects & Links'
            ? 'project'
            : '';
    return this.subjectMemories.filter(
        (m) =>
          (!type || m.type === type) &&
          `${m.title} ${m.content} ${m.tags.join(' ')} ${m.url}`
            .toLowerCase()
            .includes(this.memoryQuery.toLowerCase()) &&
          (!this.dateFilter || m.date === this.dateFilter),
      )
      .sort(
        (a, b) =>
          Number(b.isPinned) - Number(a.isPinned) ||
          (b.date || b.createdAt).localeCompare(a.date || a.createdAt),
      );
  }
  open(subject: Subject) {
    this.selectedId = subject.id;
    this.tab = 'Overview';
    this.memoryQuery = '';
    this.dateFilter = '';
  }
  playSubject() {
    if (!this.subject) return;
    // Older saved subjects gain their storyline once, without replacing their memories.
    if (!this.subject.storyline && !this.store.saveSubject(this.subject)) return;
    this.playStory.emit(this.subject);
  }
  setTab(tab: string) {
    this.tab = tab;
    this.dateFilter = '';
    this.memoryQuery = '';
  }
  initials(name: string) {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  }
  private showEditor() {
    this.error = '';
    this.notice = '';
    this.dialog()?.nativeElement.showModal();
  }
  cancel() {
    for (const id of this.newAttachmentIds) void this.attachmentStore.remove(id).catch(() => {});
    this.newAttachmentIds.clear(); this.removedAttachmentIds.clear();
    this.uploadSequence++;
    this.uploading = false;
    this.dialog()?.nativeElement.close();
    this.subjectDraft = null;
    this.professorDraft = null;
    this.memoryDraft = null;
  }
  editSubject(subject?: Subject) {
    this.subjectProfessorName = this.professorFor(subject)?.displayName || '';
    const now = new Date().toISOString();
    this.subjectDraft = subject
      ? { ...subject }
      : {
          id: crypto.randomUUID(),
          name: '',
          code: '',
          semester: '',
          description: '',
          professorCharacterId: '',
          color: '#173f35',
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        };
    this.showEditor();
  }
  editProfessor(professor?: ProfessorCharacter) {
    const now = new Date().toISOString();
    this.professorDraft = professor
      ? { ...professor }
      : {
          id: crypto.randomUUID(),
          name: '',
          displayName: '',
          pictureUrl: '',
          picturePosition: 50,
          personality: '',
          teachingStyle: '',
          dialogueStyle: '',
          background: '',
          customInstructions: '',
          createdAt: now,
          updatedAt: now,
        };
    this.showEditor();
  }
  editMemory(type: MemoryType, memory?: SubjectMemory) {
    const now = new Date().toISOString();
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.memoryDraft = memory
      ? { ...memory, tags: [...memory.tags], attachments: [...(memory.attachments ?? [])] }
      : {
          id: crypto.randomUUID(),
          subjectId: this.selectedId,
          type,
          title: '',
          content: '',
          url: '',
          tags: [],
          mood: '',
          isPinned: false,
          date,
          createdAt: now,
          updatedAt: now,
        };
    this.tags = this.memoryDraft.tags.join(', ');
    this.showEditor();
  }
  save() {
    if (this.uploading) return;
    const now = new Date().toISOString();
    let saved = false;
    if (this.subjectDraft) {
      const d = this.subjectDraft;
      const isNew = !this.store.data().subjects.some((s) => s.id === d.id);
      if (!d.name.trim() || !d.code.trim()) {
        this.error = 'Enter a subject name and code.';
        return;
      }
      saved = this.store.saveSubject({
        ...d,
        name: d.name.trim(),
        code: d.code.trim(),
        updatedAt: now,
      }, this.subjectProfessorName);
      if (saved && isNew) this.open(this.store.data().subjects.find((s) => s.id === d.id)!);
    } else if (this.professorDraft) {
      const d = this.professorDraft;
      if (!d.displayName.trim()) {
        this.error = 'Enter the professor name.';
        return;
      }
      saved = this.store.saveProfessor({
        ...d,
        name: d.displayName.trim(),
        displayName: d.displayName.trim(),
        updatedAt: now,
      });
    } else if (this.memoryDraft) {
      const d = this.memoryDraft;
      if (!d.title.trim()) {
        this.error = 'Enter a title.';
        return;
      }
      if (d.type === 'journal' && !d.date) {
        this.error = 'Choose a journal date.';
        return;
      }
      if (d.type === 'project') {
        try {
          const url = new URL(d.url);
          if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
          d.url = url.href;
        } catch {
          this.error = 'Enter a valid HTTP or HTTPS URL.';
          return;
        }
      }
      saved = this.store.saveMemory({
        ...d,
        title: d.title.trim(),
        tags: [
          ...new Set(
            this.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ],
        updatedAt: now,
      });
    }
    if (saved) {
      for (const id of this.removedAttachmentIds) void this.attachmentStore.remove(id).catch(() => {});
      this.removedAttachmentIds.clear(); this.newAttachmentIds.clear();
      this.cancel();
      this.notice = 'Saved on this browser.';
    }
  }
  async uploadAttachments(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []); input.value = '';
    if (!this.memoryDraft || !files.length) return;
    if (files.length + (this.memoryDraft.attachments?.length ?? 0) > 5) {
      this.error = 'You can attach up to 5 files per entry.'; return;
    }
    const sequence = ++this.uploadSequence;
    this.uploading = true; this.error = '';
    try {
      for (const file of files) {
        const attachment = await this.attachmentStore.add(file);
        if (sequence !== this.uploadSequence || !this.memoryDraft) {
          await this.attachmentStore.remove(attachment.id); return;
        }
        this.newAttachmentIds.add(attachment.id);
        this.memoryDraft.attachments = [...(this.memoryDraft.attachments ?? []), attachment];
      }
    } catch (error) {
      if (sequence === this.uploadSequence) this.error = error instanceof Error ? error.message : 'Upload failed. Please try again.';
    } finally {
      if (sequence === this.uploadSequence) { this.uploading = false; this.changeDetector.markForCheck(); }
    }
  }
  removeAttachment(id: string) {
    if (!this.memoryDraft) return;
    this.memoryDraft.attachments = this.memoryDraft.attachments?.filter(file => file.id !== id);
    if (this.newAttachmentIds.delete(id)) void this.attachmentStore.remove(id).catch(() => {});
    else this.removedAttachmentIds.add(id);
  }
  assign(id: string) {
    if (
      this.subject &&
      this.store.saveSubject({
        ...this.subject,
        professorCharacterId: id,
        updatedAt: new Date().toISOString(),
      })
    )
      this.notice = 'Professor assigned.';
  }
  archive(subject: Subject) {
    this.store.saveSubject({
      ...subject,
      isArchived: !subject.isArchived,
      updatedAt: new Date().toISOString(),
    });
  }
  deleteSubject(subject: Subject) {
    const attachments = this.store.data().memories.filter(m => m.subjectId === subject.id).flatMap(m => m.attachments ?? []);
    if (
      confirm(`Delete ${subject.name} and all its saved memories? This cannot be undone.`) &&
      this.store.deleteSubject(subject.id)
    ) {
      this.selectedId = '';
      for (const file of attachments) void this.attachmentStore.remove(file.id).catch(() => {});
    }
  }
  deleteMemory(memory: SubjectMemory) {
    if (confirm(`Delete “${memory.title}”? This cannot be undone.`) && this.store.deleteMemory(memory.id)) {
      for (const file of memory.attachments ?? []) void this.attachmentStore.remove(file.id).catch(() => {});
    }
  }
  pin(memory: SubjectMemory) {
    this.store.saveMemory({
      ...memory,
      isPinned: !memory.isPinned,
      updatedAt: new Date().toISOString(),
    });
  }
  async upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.professorDraft) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      !/\.(jpe?g|png|webp)$/i.test(file.name) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.error = 'Choose a JPG, PNG, or WebP image up to 5 MB.';
      return;
    }
    const sequence = ++this.uploadSequence;
    this.uploading = true;
    this.error = '';
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error();
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      if (sequence === this.uploadSequence && this.professorDraft) {
        this.professorDraft.pictureUrl = canvas.toDataURL('image/webp', 0.85);
        this.professorDraft.picturePosition = 50;
      }
    } catch {
      if (sequence === this.uploadSequence)
        this.error = 'This image could not be decoded. Try another picture.';
    } finally {
      if (sequence === this.uploadSequence) {
        this.uploading = false;
        this.changeDetector.markForCheck();
      }
    }
  }
  removePicture() {
    this.uploadSequence++;
    this.uploading = false;
    if (this.professorDraft) this.professorDraft.pictureUrl = '';
  }
  format(content: string) {
    return content.split('\n').map((text) => ({
      text: text.replace(/^#{1,3}\s+|^[-*]\s+|^\d+\.\s+/, ''),
      kind: /^#{1,3}\s/.test(text)
        ? 'heading'
        : /^[-*]\s|^\d+\.\s/.test(text)
          ? 'list'
          : 'paragraph',
    }));
  }
  export(format: 'json' | 'md') {
    const memories = this.subjectMemories;
    const content =
      format === 'json'
        ? JSON.stringify({ subject: this.subject, professor: this.professor, memories }, null, 2)
        : `# ${this.subject?.name}\n\n` +
          memories
            .map(
              (m) =>
                `## ${m.title}\n\n${m.type} | ${m.date}\n\n${m.content}\n\n${m.url}\n\n${m.tags.join(', ')}`,
            )
            .join('\n\n---\n\n');
    const url = URL.createObjectURL(
      new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `subject-memories.${format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
