import { Injectable, signal } from '@angular/core';
import { story } from '../story/story';
import { generateStoryline } from './generate-storyline';
import { ArchiveData, ProfessorCharacter, Subject, SubjectMemory } from './models';

export const ARCHIVE_KEY = 'reflection-link.subject-archive.v1';

export function initialArchive(): ArchiveData {
  const data: ArchiveData = { version: 1, subjects: [], professors: [], memories: [] };
  const now = new Date().toISOString();
  for (const scene of Object.values(story)) {
    if (!scene.character || !scene.reflection) continue;
    const r = scene.reflection;
    const reflectionDate = new Date(r.date);
    const date = Number.isNaN(reflectionDate.getTime())
      ? ''
      : `${reflectionDate.getFullYear()}-${String(reflectionDate.getMonth() + 1).padStart(2, '0')}-${String(reflectionDate.getDate()).padStart(2, '0')}`;
    let subject = data.subjects.find((s) => s.code === r.courseCode);
    if (!subject) {
      const id = `story-${r.courseCode}`;
      const professorId = `professor-${r.courseCode}`;
      data.professors.push({
        id: professorId,
        name: scene.character.name,
        displayName: scene.character.name,
        pictureUrl: '',
        picturePosition: 50,
        personality: '',
        teachingStyle: '',
        dialogueStyle: '',
        background: '',
        customInstructions: '',
        createdAt: now,
        updatedAt: now,
      });
      subject = {
        id,
        code: r.courseCode,
        name:
          scene.character.title.split(/—|â€”/).slice(1).join('—').trim() || scene.character.title,
        semester: '',
        description: '',
        professorCharacterId: professorId,
        color: scene.character.color,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };
      data.subjects.push(subject);
    }
    data.memories.push({
      id: `${scene.id}-journal`,
      subjectId: subject.id,
      type: 'journal',
      title: r.title,
      content: r.body.join('\n\n'),
      url: '',
      tags: [...r.tags],
      mood: '',
      isPinned: false,
      date,
      createdAt: now,
      updatedAt: now,
    });
    if (r.project.link)
      data.memories.push({
        id: `${scene.id}-project`,
        subjectId: subject.id,
        type: 'project',
        title: r.project.title,
        content: r.project.description,
        url: r.project.link,
        tags: [...r.tags],
        mood: '',
        isPinned: false,
        date,
        createdAt: now,
        updatedAt: now,
      });
  }
  return data;
}

@Injectable({ providedIn: 'root' })
export class ArchiveStore {
  readonly data = signal<ArchiveData>({ version: 1, subjects: [], professors: [], memories: [] });
  readonly error = signal('');
  readonly ready = signal(false);
  private writable = false;
  private lastSaved: string | null = null;

  load(): void {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      this.lastSaved = raw;
      const data = raw === null ? initialArchive() : JSON.parse(raw);
      if (
        data.version !== 1 ||
        !Array.isArray(data.subjects) ||
        !Array.isArray(data.professors) ||
        !Array.isArray(data.memories)
      ) {
        throw new Error('Unsupported archive');
      }
      this.data.set(data);
      this.writable = true;
      if (raw === null) this.commit(data);
    } catch {
      this.error.set(
        'Unable to load your archive. Existing storage was left untouched. Enable browser storage and reload.',
      );
    } finally {
      this.ready.set(true);
    }
  }

  commit(data: ArchiveData): boolean {
    if (!this.writable) return false;
    try {
      if (localStorage.getItem(ARCHIVE_KEY) !== this.lastSaved) {
        this.error.set(
          'The archive changed in another tab. Export any saved memories and reload before editing to avoid overwriting newer changes.',
        );
        return false;
      }
      const serialized = JSON.stringify(data);
      localStorage.setItem(ARCHIVE_KEY, serialized);
      this.lastSaved = serialized;
      this.data.set(data);
      this.error.set('');
      return true;
    } catch {
      this.error.set(
        'Save failed: browser storage is unavailable or full. Your changes are still in the editor. Export saved memories or free storage, then try again.',
      );
      return false;
    }
  }

  saveSubject(subject: Subject, professorName?: string): boolean {
    const d = this.data();
    let professors = d.professors;
    if (professorName !== undefined) {
      const name = professorName.trim();
      let professor = professors.find(p => p.displayName.toLocaleLowerCase() === name.toLocaleLowerCase());
      if (name && !professor) {
        const now = new Date().toISOString();
        professor = { id: crypto.randomUUID(), name, displayName: name, pictureUrl: '', picturePosition: 50,
          personality: '', teachingStyle: '', dialogueStyle: '', background: '', customInstructions: '', createdAt: now, updatedAt: now };
        professors = [...professors, professor];
      }
      subject = { ...subject, professorCharacterId: name ? professor!.id : '' };
    }
    const existing = d.subjects.find((s) => s.id === subject.id);
    subject = {
      ...subject,
      storyline:
        existing?.storyline ??
        subject.storyline ??
        generateStoryline(
          subject,
          professors.find((p) => p.id === subject.professorCharacterId),
        ),
    };
    return this.commit({
      ...d,
      professors,
      subjects: [...d.subjects.filter((s) => s.id !== subject.id), subject],
    });
  }
  saveProfessor(professor: ProfessorCharacter): boolean {
    const d = this.data();
    return this.commit({
      ...d,
      professors: [...d.professors.filter((p) => p.id !== professor.id), professor],
    });
  }
  prepareStoryline(subject: Subject): Subject | undefined {
    if (subject.storyline?.flowVersion === 2) return subject;
    const d = this.data();
    const updated = { ...subject, storyline: generateStoryline(subject, d.professors.find(p => p.id === subject.professorCharacterId)) };
    return this.commit({ ...d, subjects: d.subjects.map(s => s.id === subject.id ? updated : s) }) ? updated : undefined;
  }
  saveMemory(memory: SubjectMemory): boolean {
    const d = this.data();
    if (!d.subjects.some((s) => s.id === memory.subjectId)) return false;
    return this.commit({
      ...d,
      memories: [...d.memories.filter((m) => m.id !== memory.id), memory],
      subjects: d.subjects.map((s) =>
        s.id === memory.subjectId ? { ...s, updatedAt: memory.updatedAt } : s,
      ),
    });
  }
  deleteSubject(id: string): boolean {
    const d = this.data();
    return this.commit({
      ...d,
      subjects: d.subjects.filter((s) => s.id !== id),
      memories: d.memories.filter((m) => m.subjectId !== id),
    });
  }
  deleteMemory(id: string): boolean {
    const d = this.data();
    return this.commit({ ...d, memories: d.memories.filter((m) => m.id !== id) });
  }
}
