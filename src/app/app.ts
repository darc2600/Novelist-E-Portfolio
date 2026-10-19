import { afterNextRender, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import type { Choice, Character, Flags, ReflectionEntry, Scene } from './story/types';
import { story } from './story/story';
import { backgrounds } from './story/backgrounds';
import { Subjects } from './subjects/subjects';
import { ArchiveStore } from './subjects/archive-store';
import { AttachmentPreview } from './subjects/attachment-preview';
import type { Subject, MemoryType } from './subjects/models';
import type { StoryData } from './story/types';

const routeIndicators = [
  { flag: 'visited_uxd', label: 'DES 301' },
  { flag: 'visited_webdev', label: 'CS 284' },
  { flag: 'visited_research', label: 'SOC 210' },
  { flag: 'visited_ethics', label: 'PHIL 320' },
];

@Component({
  selector: 'app-root',
  imports: [Subjects, AttachmentPreview],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly showSubjects = signal(false);
  protected readonly creatingSubject = signal(false);
  protected openSubjectArchive(add: boolean): void {
    this.activeSubjectId.set('');
    this.creatingSubject.set(add);
    this.showSubjects.set(true);
  }
  protected readonly activeSubjectId = signal('');
  private readonly hallwayPage = signal(0);
  private get hubSubjectChoices(): Choice[] {
    const data = this.archive.data();
    const original = (story['hub'].choices ?? []).filter(c => c.next !== 'ending').filter(c => {
      if (!this.archive.ready()) return true;
      const code = story[c.next]?.character?.title.split(' — ')[0];
      return data.subjects.some(s => s.id === `story-${code}` && !s.isArchived);
    }).map(c => {
      const character = story[c.next].character!;
      return { ...c, label: `${this.storyCharacter(character).name} · ${character.title.split(' — ')[0]}` };
    });
    return [...original, ...this.customSubjects.map(s => ({
      label: `${data.professors.find(p => p.id === s.professorCharacterId)?.displayName || 'Professor'} · ${s.code} — ${s.name}`,
      next: `subject-route:${s.id}`,
    }))];
  }
  protected get hallwayIndex(): number {
    return Math.min(this.hallwayPage(), Math.max(0, Math.ceil(this.hubSubjectChoices.length / 5) - 1));
  }
  private readonly archive = inject(ArchiveStore);
  protected get portfolioName(): string {
    return this.archive.data().portfolioName || 'Jillian Pascua';
  }
  private subjectScenes: StoryData = {};
  private memoryScenes: StoryData = {};
  private readonly loadedBackground = signal('');
  protected readonly sceneId = signal('title');
  protected readonly lineIndex = signal(0);
  protected readonly flags = signal<Flags>({});
  protected readonly fadingOut = signal(false);
  protected readonly showReflection = signal(false);
  protected readonly reflectionDismissed = signal(false);
  protected readonly bgLoaded = computed(() => this.loadedBackground() === this.scene.background);
  protected backgroundLoaded(url: string): void {
    this.loadedBackground.set(url);
  }
  protected readonly displayedLine = signal('');
  protected readonly typewriterDone = signal(false);
  protected readonly reflectionVisible = signal(false);
  protected get routeIndicators() {
    const originals = routeIndicators.filter(r => !this.archive.ready() || this.archive.data().subjects.some(s => s.id === `story-${r.label}` && !s.isArchived));
    return [...originals, ...this.customSubjects.map(s => ({ flag: `visited_subject_${s.id}`, label: s.code }))];
  }
  private get customSubjects() {
    return this.archive.data().subjects.filter(s => !s.isArchived && !s.id.startsWith('story-'))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }
  protected get courseCount(): number {
    return this.archive.data().subjects.length;
  }
  protected get professorCount(): number {
    return this.archive.data().professors.length;
  }
  private get courseSummary(): string {
    return `${this.courseCount} ${this.courseCount === 1 ? 'course' : 'courses'}. ${this.professorCount} ${this.professorCount === 1 ? 'professor' : 'professors'}. Lessons you're still trying to put into words.`;
  }

  private timers: ReturnType<typeof setTimeout>[] = [];
  private typewriter: ReturnType<typeof setInterval> | undefined;

  constructor() {
    afterNextRender(() => { if (!this.archive.ready()) this.archive.load(); });
  }

  private storyCharacter(character: Character): Character {
    const data = this.archive.data();
    const subject = data.subjects.find(s => s.id === `story-${character.title.split(' — ')[0]}`);
    const professor = data.professors.find(p => p.id === subject?.professorCharacterId);
    if (!professor) return character;
    return { ...character, name: professor.displayName,
      initials: professor.displayName.split(/\s+/).map(n => n[0]).slice(0, 2).join(''),
      pictureUrl: professor.pictureUrl, picturePosition: professor.picturePosition };
  }
  private storyText(text: string, character?: Character): string {
    if (!character) return text;
    const current = this.storyCharacter(character);
    const aliases = [...new Set([character.name, ...Object.values(story).flatMap(scene =>
      scene.lines.filter(line => line.character?.title === character.title && line.speaker).map(line => line.speaker!)
    )])].sort((a, b) => b.length - a.length);
    const pattern = aliases.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return text.replace(new RegExp(pattern, 'g'), () => current.name);
  }

  protected get scene(): Scene {
    if (this.memoryScenes[this.sceneId()]) return this.memoryScenes[this.sceneId()];
    const scene = this.subjectScenes[this.sceneId()] ?? story[this.sceneId()];
    if (this.subjectScenes[this.sceneId()]) return scene;
    return { ...scene,
      background: scene.id === 'hub' ? [backgrounds.facultyCorridor, backgrounds.eastHallway, backgrounds.westHallway][this.hallwayIndex % 3] : scene.background,
      character: scene.character ? this.storyCharacter(scene.character) : undefined,
      reflection: scene.reflection ? { ...scene.reflection, body: scene.reflection.body.map(text => this.storyText(text, scene.character)) } : undefined,
      lines: (scene.id === 'hub' && this.hallwayIndex > 0 ? [
        { text: `You walk into hallway ${this.hallwayIndex + 1}. The afternoon light shifts across a different row of classroom doors.` },
        { text: 'More conversations are waiting here. Which professor will you visit?' },
      ] : scene.lines).map(line => ({ ...line,
        text: this.storyText(line.text.replace('{{courseSummary}}', this.courseSummary), scene.character),
        ...(line.character ? { character: this.storyCharacter(line.character), speaker: this.storyCharacter(line.character).name } : {}),
      })),
      choices: scene.choices?.map(choice => {
        const target = story[choice.next]?.character;
        if (!target || scene.id !== 'hub') return { ...choice, label: this.storyText(choice.label, scene.character) };
        return { ...choice, label: `${this.storyCharacter(target).name} · ${target.title.split(' — ')[0]}` };
      }),
    };
  }

  protected playSubject(subject: Subject): void {
    const prepared = this.archive.prepareStoryline(subject);
    if (!prepared) return;
    subject = prepared;
    if (!subject.storyline) return;
    const professor = this.archive
      .data()
      .professors.find((p) => p.id === subject.professorCharacterId);
    this.subjectScenes = Object.fromEntries(
      Object.entries(subject.storyline.scenes).map(([id, scene]) => {
        const character: Character = {
          ...scene.character!,
          color: subject.color,
          name: professor?.displayName || `Your ${subject.code} professor`,
          initials:
            professor?.displayName
              .split(/\s+/)
              .map((n) => n[0])
              .slice(0, 2)
              .join('') || 'P',
          pictureUrl: professor?.pictureUrl,
          picturePosition: professor?.picturePosition,
        };
        return [
          id,
          {
            ...scene,
            background: backgrounds.classroom,
            character,
            lines: scene.lines.map((line) =>
              line.speaker ? { ...line, speaker: character.name, character } : line,
            ),
          },
        ];
      }),
    );
    this.activeSubjectId.set(subject.id);
    const position = this.hubSubjectChoices.findIndex(c => c.next === `subject-route:${subject.id}`);
    if (position >= 0) this.hallwayPage.set(Math.floor(position / 5));
    this.showSubjects.set(false);
    this.goToScene(subject.storyline.entrySceneId);
  }

  protected get currentLine() {
    return this.scene.lines[this.lineIndex()];
  }

  protected get pastAllLines(): boolean {
    return this.lineIndex() >= this.scene.lines.length;
  }

  protected get visibleChoices(): Choice[] {
    let choices = this.scene.choices ?? [];
    if (this.scene.character && this.scene.choices && !this.memoryScenes[this.sceneId()] && !this.scene.reflection) {
      choices = [
        { label: 'Projects & Links', next: 'browse-memories:project' },
        { label: 'Notes', next: 'browse-memories:note' },
        { label: 'Journal', next: 'browse-memories:journal' },
        ...choices.filter(c => c.next === 'hub' || c.next === 'subject-hub'),
      ];
    }
    if (this.sceneId() === 'hub') {
      const subjects = this.hubSubjectChoices;
      const page = this.hallwayIndex;
      choices = [...subjects.slice(page * 5, page * 5 + 5),
        ...(subjects.length > (page + 1) * 5 ? [{ label: `Go to the next hallway (Hallway ${page + 2}).`, next: `hallway:${page + 1}` }] : []),
        ...(page > 0 ? [{ label: `Go back to Hallway ${page}.`, next: `hallway:${page - 1}` }] : []),
        ...choices.filter(c => c.next === 'ending').map(c => ({ ...c, requiresAll: this.routeIndicators.map(r => r.flag) }))];
    }
    return choices.filter((choice) => {
      if (choice.next === 'subject-archive') return false;
      if (choice.requiresAll) return choice.requiresAll.every((flag) => this.flags()[flag]);
      if (choice.requiresAny) return choice.requiresAny.some((flag) => this.flags()[flag]);
      return true;
    });
  }

  protected get reflection(): ReflectionEntry | undefined {
    return this.scene.reflection;
  }

  protected startStory(): void {
    this.hallwayPage.set(0);
    this.goToScene('intro');
  }

  protected advanceDialogue(): void {
    if (!this.typewriterDone()) {
      this.displayedLine.set(this.currentLine?.text ?? '');
      this.typewriterDone.set(true);
      if (this.typewriter) clearInterval(this.typewriter);
      return;
    }

    if (this.lineIndex() < this.scene.lines.length - 1) {
      this.lineIndex.update((index) => index + 1);
      this.beginTypewriter();
    } else if (!this.scene.choices && this.scene.next) {
      this.goToScene(this.scene.next, this.scene.setFlag);
    } else {
      this.lineIndex.set(this.scene.lines.length);
    }
  }

  protected choose(choice: Choice): void {
    if (choice.next.startsWith('hallway:')) {
      const page = Number(choice.next.slice('hallway:'.length));
      if (Number.isInteger(page) && page >= 0 && page < Math.ceil(this.hubSubjectChoices.length / 5)) {
        this.hallwayPage.set(page);
        this.goToScene('hub');
      }
      return;
    }
    if (choice.next.startsWith('browse-memories:')) {
      const category = choice.next.slice('browse-memories:'.length);
      if (category === 'project' || category === 'note' || category === 'journal') this.browseMemories(category);
      return;
    }
    if (choice.next === 'browse-memories') {
      this.browseMemories();
      return;
    }
    if (choice.next.startsWith('subject-route:')) {
      let subject = this.customSubjects.find(s => s.id === choice.next.slice('subject-route:'.length));
      if (!subject) return;
      if (!subject.storyline) {
        if (!this.archive.saveSubject(subject)) return;
        subject = this.archive.data().subjects.find(s => s.id === subject!.id)!;
      }
      this.playSubject(subject);
      return;
    }
    if (choice.next === 'subject-hub') {
      this.goToScene('hub', `visited_subject_${this.activeSubjectId()}`);
      return;
    }
    if (choice.next === 'subject-archive') {
      if (this.subjectScenes[this.sceneId()]) this.flags.update(flags => ({ ...flags, [`visited_subject_${this.activeSubjectId()}`]: true }));
      this.showSubjects.set(true);
      this.goToScene('title');
      return;
    }
    this.goToScene(choice.next, choice.setFlag);
  }

  private browseMemories(selectedCategory?: MemoryType): void {
    const source = this.scene;
    const returnScene = this.sceneId();
    const data = this.archive.data();
    const subject = this.subjectScenes[returnScene]
      ? data.subjects.find(s => s.id === this.activeSubjectId())
      : data.subjects.find(s => s.id === `story-${source.character?.title.split(' — ')[0]}`);
    if (!subject || !source.character) return;
    const character = source.character;
    const say = (text: string) => ({ speaker: character.name, character, text });
    const add = (id: string, extra: Partial<Scene>) => {
      this.memoryScenes[id] = { id, background: source.background, bgColor: source.bgColor, character, lines: [], ...extra };
    };
    this.memoryScenes = {};
    const categories = [
      { type: 'project', label: 'Projects & Links' },
      { type: 'note', label: 'Notes' },
      { type: 'journal', label: 'Journal' },
    ] as const;
    add('memory-menu', {
      lines: [say(`What would you like to revisit from ${subject.name}?`)],
      choices: [...categories.map(c => ({ label: c.label, next: `memory-list-${c.type}` })),
        { label: 'Return to our conversation.', next: returnScene }],
    });
    for (const category of categories) {
      const listId = `memory-list-${category.type}`;
      const entries = data.memories.filter(m => m.subjectId === subject.id && m.type === category.type)
        .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || (b.date || b.createdAt).localeCompare(a.date || a.createdAt));
      add(listId, {
        lines: entries.length
          ? [say(`Let's look back at your ${category.label.toLowerCase()} for ${subject.name}. Which one would you like to open?`)]
          : [say(`There are no saved ${category.label.toLowerCase()} for ${subject.name} yet.`)],
        choices: [...entries.map(m => ({ label: `${m.isPinned ? '★ ' : ''}${m.title}`, next: `memory-entry-${m.id}` })),
          ...(category.type === 'journal' && !entries.length ? (source.choices ?? []).filter(c => (this.subjectScenes[c.next] ?? story[c.next])?.reflection) : []),
          { label: 'Return to our conversation.', next: returnScene }],
      });
      entries.forEach((memory, index) => add(`memory-entry-${memory.id}`, {
        lines: [say(`Here is your saved ${category.label.toLowerCase()} entry: ${memory.title}.`)],
        reflection: {
          attachments: memory.attachments,
          memoryKind: memory.type, hideRelatedArtifact: memory.type !== 'project',
          lessonNumber: index + 1, courseCode: subject.code, title: memory.title,
          date: memory.date || memory.createdAt.split('T')[0], body: memory.content.split('\n'), tags: memory.tags,
          project: { title: memory.title, description: memory.content, imageUrl: '', link: memory.type === 'project' ? memory.url : undefined },
        },
        next: listId,
      }));
    }
    this.goToScene(selectedCategory ? `memory-list-${selectedCategory}` : 'memory-menu');
  }

  protected continueScene(): void {
    if (this.scene.next) this.goToScene(this.scene.next, this.scene.setFlag);
  }

  protected restart(): void {
    this.hallwayPage.set(0);
    this.flags.set({});
    this.goToScene('title');
  }

  protected dismissReflection(): void {
    this.reflectionVisible.set(false);
    this.later(() => {
      this.showReflection.set(false);
      this.reflectionDismissed.set(true);
    }, 350);
  }

  protected closeReflectionFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.dismissReflection();
  }

  protected locationTitle(): string {
    return (
      this.scene.character?.title ??
      (this.sceneId() === 'hub' ? `FACULTY BUILDING · HALLWAY ${this.hallwayIndex + 1}` : 'CAMPUS · AFTER HOURS')
    );
  }

  protected characterStyle(character: Character): string {
    return `--character-color: ${character.color}`;
  }

  protected paddedLesson(number: number): string {
    return String(number).padStart(2, '0');
  }

  private goToScene(id: string, extraFlag?: string): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
    if (this.typewriter) clearInterval(this.typewriter);
    this.fadingOut.set(true);
    this.later(() => {
      this.sceneId.set(id);
      if (extraFlag) this.flags.update((flags) => ({ ...flags, [extraFlag]: true }));
      this.lineIndex.set(0);
      this.showReflection.set(false);
      this.reflectionDismissed.set(false);
      this.fadingOut.set(false);
      this.beginTypewriter();
      if (this.scene.reflection) {
        this.later(() => {
          this.showReflection.set(true);
          this.later(() => this.reflectionVisible.set(true), 50);
        }, 400);
      }
    }, 400);
  }

  private beginTypewriter(): void {
    if (this.typewriter) clearInterval(this.typewriter);
    const text = this.currentLine?.text ?? '';
    let index = 0;
    this.displayedLine.set('');
    this.typewriterDone.set(text.length === 0);
    if (!text) return;
    this.typewriter = setInterval(() => {
      index += 1;
      this.displayedLine.set(text.slice(0, index));
      if (index >= text.length) {
        if (this.typewriter) clearInterval(this.typewriter);
        this.typewriterDone.set(true);
      }
    }, 24);
  }

  private later(callback: () => void, delay: number): void {
    this.timers.push(setTimeout(callback, delay));
  }

  ngOnDestroy(): void {
    if (this.typewriter) clearInterval(this.typewriter);
    this.timers.forEach((timer) => clearTimeout(timer));
  }
}
