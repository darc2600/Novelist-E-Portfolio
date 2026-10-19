import type { Character, Scene, StoryData } from '../story/types';
import { backgrounds } from '../story/backgrounds';
import type { ProfessorCharacter, Subject, SubjectStoryline } from './models';

// Follow the original visit, memory-file, conversation, and return flow.
export function generateStoryline(subject: Subject, professor?: ProfessorCharacter): SubjectStoryline {
  const id = (name: string) => `subject-${subject.id}-${name}`;
  const character: Character = {
    name: professor?.displayName || `Your ${subject.code} professor`,
    title: `${subject.code} — ${subject.name}`, color: subject.color,
    initials: professor?.displayName.split(/\s+/).map(n => n[0]).slice(0, 2).join('') || 'P',
  };
  const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];
  const opening = pick([
    'The professor sorts a stack of papers as the afternoon light reaches the desk.',
    'A notebook lies beside a cooling cup of tea. The professor looks up as you arrive.',
    'The last class has ended. Your professor pauses at the doorway and waves you inside.',
    'Rain softens the noise outside. Your professor pulls out a chair for one final conversation.',
  ]);
  const project = pick(['a community exhibition', 'a student-led workshop', 'a campus proposal', 'a collaborative presentation']);
  const twist = pick(['an assumption that did not survive testing', 'feedback from an unexpected perspective', 'a result that contradicted your prediction', 'a limitation that forced a different approach']);
  const background = backgrounds.classroom;
  const scenes: StoryData = {};
  const say = (text: string) => ({ speaker: character.name, character, text });
  const add = (name: string, lines: Scene['lines'], options: Partial<Scene> = {}) => {
    const sceneId = id(name);
    scenes[sceneId] = { id: sceneId, background, bgColor: '#17352d', character, lines, ...options };
  };
  add('arrival', [
    { text: opening },
    say(`Come in. We have reached the end of ${subject.name} (${subject.code})${subject.semester ? `, ${subject.semester}` : ''}.`),
    ...(subject.description.trim() ? [say(`We began with this idea: ${subject.description.trim()}`)] : []),
    say('Before you go, tell me: which lesson stayed with you?'),
  ], { choices: [
    { label: `“The question that changed how I understood ${subject.name}.”`, next: id('investigate') },
    { label: `“The time we tried ${project} and it did not go to plan.”`, next: id('experiment') },
    { label: '“The feedback that made me rethink my first answer.”', next: id('feedback') },
    { label: '“Thank you. I should visit the other professors.”', next: 'subject-hub' },
  ] });
  const lessons = [
    { key: 'investigate', title: `A different question in ${subject.name}`, activity: `Question journal — ${subject.code}`,
      body: `In this imagined ${subject.name} exercise, I began with a confident answer. A closer look revealed ${twist}. Asking a more precise question became more useful than defending the first answer.`,
      reply: 'You remember the moment your explanation stopped being automatic. That is where understanding starts.',
      takeaway: 'Keep both questions in your notes: the one you started with and the one you learned to ask.' },
    { key: 'experiment', title: 'Learning through an unfinished attempt', activity: `${subject.name}: ${project}`,
      body: `For this fictional ${subject.name} project, we prepared ${project}. The first attempt revealed ${twist}. The revision connected the course ideas to something we could demonstrate rather than merely describe.`,
      reply: 'The first version was not wasted. It gave you something specific to question and improve.',
      takeaway: 'Save the evidence of what changed alongside the finished work. Your reasoning is part of the project.' },
    { key: 'feedback', title: 'The conversation that changed my approach', activity: `Reflection and revision — ${subject.code}`,
      body: `This imagined discussion in ${subject.name} turned on ${twist}. Listening to another explanation helped me see what my own account left out. I could explain my next decision more clearly afterward.`,
      reply: 'You did not have to agree with every suggestion. You learned to choose one and explain why it mattered.',
      takeaway: 'A reflection can stay unfinished. Write down the question you are carrying into the next subject.' },
  ];
  lessons.forEach((lesson, index) => add(lesson.key, [
    say(lesson.reply), say(lesson.takeaway), say('What else do you remember?'),
  ], {
    reflection: { lessonNumber: index + 1, courseCode: subject.code, title: lesson.title,
      date: 'Generated story reflection', body: [lesson.body, lesson.takeaway], tags: [subject.code, 'story reflection'],
      project: { title: lesson.activity, imageUrl: background, description: 'Suggested story activity. Add your actual work to this subject’s Projects & Links.' } },
    next: id('arrival'),
  }));
  return { flowVersion: 2, entrySceneId: id('arrival'), scenes, generatedAt: new Date().toISOString() };
}
