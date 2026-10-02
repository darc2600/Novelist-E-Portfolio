export interface Character {
  name: string
  color: string
  initials: string
  title: string
}

export interface SceneLine {
  speaker?: string
  character?: Character
  text: string
}

export interface Choice {
  label: string
  next: string
  setFlag?: string
  requiresAll?: string[]
  requiresAny?: string[]
}

export interface ReflectionEntry {
  lessonNumber: number
  courseCode: string
  title: string
  date: string
  body: string[]
  tags: string[]
  project: {
    title: string
    imageUrl: string
    link?: string
    description: string
  }
}

export interface Scene {
  id: string
  background: string
  bgColor: string
  character?: Character
  lines: SceneLine[]
  choices?: Choice[]
  next?: string
  reflection?: ReflectionEntry
  setFlag?: string
  isTitle?: boolean
  isEnding?: boolean
}

export type StoryData = Record<string, Scene>
export type Flags = Record<string, boolean>
