import { Component, OnDestroy, signal } from '@angular/core';
import type { Choice, Character, Flags, ReflectionEntry, Scene } from './story/types';
import { story } from './story/story';

const routeIndicators = [
  { flag: 'visited_uxd', label: 'DES 301' },
  { flag: 'visited_webdev', label: 'CS 284' },
  { flag: 'visited_research', label: 'SOC 210' },
  { flag: 'visited_ethics', label: 'PHIL 320' },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly sceneId = signal('title');
  protected readonly lineIndex = signal(0);
  protected readonly flags = signal<Flags>({});
  protected readonly fadingOut = signal(false);
  protected readonly showReflection = signal(false);
  protected readonly reflectionDismissed = signal(false);
  protected readonly bgLoaded = signal(false);
  protected readonly displayedLine = signal('');
  protected readonly typewriterDone = signal(false);
  protected readonly reflectionVisible = signal(false);
  protected readonly routeIndicators = routeIndicators;

  private timers: ReturnType<typeof setTimeout>[] = [];
  private typewriter: ReturnType<typeof setInterval> | undefined;

  protected get scene(): Scene {
    return story[this.sceneId()];
  }

  protected get currentLine() {
    return this.scene.lines[this.lineIndex()];
  }

  protected get pastAllLines(): boolean {
    return this.lineIndex() >= this.scene.lines.length;
  }

  protected get visibleChoices(): Choice[] {
    return (this.scene.choices ?? []).filter((choice) => {
      if (choice.requiresAll) return choice.requiresAll.every((flag) => this.flags()[flag]);
      if (choice.requiresAny) return choice.requiresAny.some((flag) => this.flags()[flag]);
      return true;
    });
  }

  protected get reflection(): ReflectionEntry | undefined {
    return this.scene.reflection;
  }

  protected startStory(): void {
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
    this.goToScene(choice.next, choice.setFlag);
  }

  protected continueScene(): void {
    if (this.scene.next) this.goToScene(this.scene.next, this.scene.setFlag);
  }

  protected restart(): void {
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
    return this.scene.character?.title ?? (this.sceneId() === 'hub' ? 'FACULTY BUILDING' : 'CAMPUS · AFTER HOURS');
  }

  protected characterStyle(character: Character): string {
    return `--character-color: ${character.color}`;
  }

  protected paddedLesson(number: number): string {
    return String(number).padStart(2, '0');
  }

  private goToScene(id: string, extraFlag?: string): void {
    this.fadingOut.set(true);
    this.later(() => {
      this.sceneId.set(id);
      if (extraFlag) this.flags.update((flags) => ({ ...flags, [extraFlag]: true }));
      this.lineIndex.set(0);
      this.bgLoaded.set(false);
      this.showReflection.set(false);
      this.reflectionDismissed.set(false);
      this.fadingOut.set(false);
      this.beginTypewriter();
      if (story[id].reflection) {
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
