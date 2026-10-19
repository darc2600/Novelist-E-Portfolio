import type { StoryData } from '../story/types';

export interface SubjectStoryline {
  flowVersion?: number;
  entrySceneId: string;
  scenes: StoryData;
  generatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  description: string;
  professorCharacterId: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  storyline?: SubjectStoryline;
}
export interface ProfessorCharacter {
  id: string;
  name: string;
  displayName: string;
  pictureUrl: string;
  picturePosition: number;
  personality: string;
  teachingStyle: string;
  dialogueStyle: string;
  background: string;
  customInstructions: string;
  createdAt: string;
  updatedAt: string;
}
export type MemoryType = 'project' | 'note' | 'journal';
export interface MemoryAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}
export interface SubjectMemory {
  attachments?: MemoryAttachment[];
  id: string;
  subjectId: string;
  type: MemoryType;
  title: string;
  content: string;
  url: string;
  tags: string[];
  mood: string;
  isPinned: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}
export interface ArchiveData {
  version: 1;
  subjects: Subject[];
  professors: ProfessorCharacter[];
  memories: SubjectMemory[];
}
