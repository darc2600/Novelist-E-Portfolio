import type { Character, StoryData } from './types'

export const MAYA: Character = {
  name: 'Prof. Maya Torres',
  color: '#C2540A',
  initials: 'MT',
  title: 'DES 301 — User Experience Design',
}

export const DAVID: Character = {
  name: 'Prof. David Kim',
  color: '#3A3066',
  initials: 'DK',
  title: 'CS 284 — Full-Stack Web Development',
}

export const ANYA: Character = {
  name: 'Prof. Anya Obi',
  color: '#2D6A4F',
  initials: 'AO',
  title: 'SOC 210 — Research Methods',
}

export const LARS: Character = {
  name: 'Prof. Lars Eriksen',
  color: '#1E3A5F',
  initials: 'LE',
  title: 'PHIL 320 — Technology Ethics',
}

export const story: StoryData = {
  // ── TITLE ──────────────────────────────────────────────────────
  title: {
    id: 'title',
    background:
      'https://images.unsplash.com/photo-1747502064507-ed08d79802db?w=1600&h=1000&fit=crop&auto=format',
    bgColor: '#0f0e17',
    lines: [],
    isTitle: true,
    next: 'intro',
  },

  // ── INTRO ──────────────────────────────────────────────────────
  intro: {
    id: 'intro',
    background:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#1a1a2e',
    lines: [
      { text: 'End of semester. The building is almost empty.' },
      { text: 'Your notebook sits open — not to study, but to remember.' },
      {
        text: 'Four courses. Four professors who handed you something you\'re still trying to put into words.',
      },
      { text: 'You decide to visit them one last time before it\'s over.' },
    ],
    next: 'hub',
  },

  // ── HUB ───────────────────────────────────────────────────────
  hub: {
    id: 'hub',
    background:
      'https://images.unsplash.com/photo-1562774053-701939374585?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#1c1c2e',
    lines: [
      { text: 'The Faculty Building. Chalk-smell and late afternoon light.' },
      { text: 'Whose door do you knock on?' },
    ],
    choices: [
      {
        label: 'Room 204 — Prof. Torres  ·  DES 301',
        next: 'uxd_intro',
        setFlag: 'visited_uxd',
      },
      {
        label: 'Lab 112 — Prof. Kim  ·  CS 284',
        next: 'webdev_intro',
        setFlag: 'visited_webdev',
      },
      {
        label: 'Room 318 — Prof. Obi  ·  SOC 210',
        next: 'research_intro',
        setFlag: 'visited_research',
      },
      {
        label: 'Room 402 — Prof. Eriksen  ·  PHIL 320',
        next: 'ethics_intro',
        setFlag: 'visited_ethics',
      },
      {
        label: 'I think I\'m ready to leave.',
        next: 'ending',
        requiresAll: ['visited_uxd', 'visited_webdev', 'visited_research', 'visited_ethics'],
      },
    ],
  },

  // ── UXD INTRO ─────────────────────────────────────────────────
  uxd_intro: {
    id: 'uxd_intro',
    background:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#2d1a0e',
    character: MAYA,
    lines: [
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'Oh — come in! I was just packing up the semester.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'You made it through DES 301. That\'s genuinely no small thing.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'So. What stayed with you?',
      },
    ],
    choices: [
      {
        label: '"The empathy mapping session. I haven\'t thought about users the same way since."',
        next: 'uxd_r1',
      },
      {
        label: '"Honestly? Getting humbled by a paper prototype."',
        next: 'uxd_r2',
      },
      {
        label: '"The Spotify audit. I can\'t use it without noticing the failures now."',
        next: 'uxd_r3',
      },
      { label: '"Thank you, Prof. Torres. I should keep going."', next: 'hub' },
    ],
  },

  uxd_r1: {
    id: 'uxd_r1',
    background:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#2d1a0e',
    character: MAYA,
    reflection: {
      lessonNumber: 1,
      courseCode: 'DES 301',
      title: 'Design Thinking & Empathy Mapping',
      date: 'September 4, 2024',
      body: [
        'This session fundamentally shifted how I think about design. We were given a case about a hospital wayfinding system and asked to map what a first-time patient thinks, feels, says, and does when navigating the space.',
        'What struck me was how much information lives outside the interface itself — anxiety, time pressure, and the emotional state of the user shape how a system is perceived far more than its visual clarity alone.',
        'Prof. Torres introduced "designing for extremes": solutions built for the most stressed or impaired users almost always work better for everyone. I plan to carry this into every critique.',
      ],
      tags: ['empathy mapping', 'user research', 'design thinking'],
      project: {
        title: 'Hospital Wayfinding Audit',
        imageUrl:
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=380&fit=crop&auto=format',
        description:
          'Journey map and empathy map for a first-time patient navigating a large hospital system.',
        link: 'https://example.com/wayfinding',
      },
    },
    lines: [
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'You actually got it. Most students treat empathy mapping as a deliverable. It\'s a posture.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: '"Designing for extremes." I\'ll be saying that phrase until I retire.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'What else do you remember?',
      },
    ],
    next: 'uxd_intro',
  },

  uxd_r2: {
    id: 'uxd_r2',
    background:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#2d1a0e',
    character: MAYA,
    reflection: {
      lessonNumber: 4,
      courseCode: 'DES 301',
      title: 'Prototype Fidelity & Feedback Loops',
      date: 'September 25, 2024',
      body: [
        'We ran a live usability test comparing a paper prototype against a Figma prototype of the same onboarding flow. The paper group surfaced three critical issues in under ten minutes — none of which the Figma group found because participants kept commenting on visual choices instead.',
        'This was humbling. I had spent six hours refining the Figma version, convinced polish would help testers "take it seriously." The opposite was true.',
        'The lesson: prototype at the fidelity of the question you\'re asking, not the fidelity of your confidence.',
      ],
      tags: ['prototyping', 'usability testing', 'iteration'],
      project: {
        title: 'Onboarding Flow — Paper Prototype',
        imageUrl:
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=380&fit=crop&auto=format',
        description:
          'Paper sketches + synthesis notes from the low-fidelity usability test session.',
      },
    },
    lines: [
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'Six hours on Figma. I remember that session.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'The students who are hardest to humble become the best designers. Eventually.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'Anything else on your mind?',
      },
    ],
    next: 'uxd_intro',
  },

  uxd_r3: {
    id: 'uxd_r3',
    background:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#2d1a0e',
    character: MAYA,
    reflection: {
      lessonNumber: 8,
      courseCode: 'DES 301',
      title: 'Accessibility as Design Constraint',
      date: 'October 23, 2024',
      body: [
        'We audited Spotify\'s podcast interface against WCAG 2.1 AA. Finding contrast failures on buttons I use every day was jarring — these weren\'t edge cases, they were primary actions.',
        'What shifted my thinking was reframing accessibility not as remediation but as evidence of design quality. Every failure is a gap between what the product claims to be and what it actually is.',
        'Building with screen readers and keyboard navigation from the start is half the work of retrofitting later, and the resulting markup is cleaner by design.',
      ],
      tags: ['accessibility', 'WCAG', 'audit'],
      project: {
        title: 'Spotify Accessibility Audit',
        imageUrl:
          'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=380&fit=crop&auto=format',
        description:
          '24-point accessibility audit identifying contrast, navigation, and semantic markup failures.',
        link: 'https://example.com/a11y-audit',
      },
    },
    lines: [
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'That\'s exactly what I wanted you to take from that unit.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'Accessibility isn\'t compliance. It\'s proof that you actually finished the job.',
      },
      {
        speaker: 'Prof. Torres',
        character: MAYA,
        text: 'Anything else?',
      },
    ],
    next: 'uxd_intro',
  },

  // ── WEB DEV INTRO ─────────────────────────────────────────────
  webdev_intro: {
    id: 'webdev_intro',
    background:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0f0e2e',
    character: DAVID,
    lines: [
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'Still here. Good.',
      },
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'CS 284. Twelve weeks, more bugs than I can count, three students who genuinely scared me with how fast they learned.',
      },
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'Tell me one thing that actually changed how you write code.',
      },
    ],
    choices: [
      {
        label: '"State lives where it needs to be visible, not where it\'s convenient to change."',
        next: 'webdev_r1',
      },
      {
        label: '"Any ORM query inside a loop is a red flag. I check for it in every review now."',
        next: 'webdev_r2',
      },
      {
        label: '"Security decisions aren\'t configuration — they\'re architecture."',
        next: 'webdev_r3',
      },
      { label: '"I learned a lot. Thanks, Prof. Kim."', next: 'hub' },
    ],
  },

  webdev_r1: {
    id: 'webdev_r1',
    background:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0f0e2e',
    character: DAVID,
    reflection: {
      lessonNumber: 2,
      courseCode: 'CS 284',
      title: 'State Management & Component Architecture',
      date: 'September 10, 2024',
      body: [
        'The debugging session this week was more valuable than any lecture. We inherited a React codebase with prop drilling six levels deep and spent the class tracing why a checkbox change wasn\'t updating a sibling\'s badge count.',
        'Prof. Kim\'s framework stuck with me: "State lives where it needs to be visible, not where it\'s convenient to change." Understanding that distinction resolved about half of the component architecture questions I\'ve been carrying since the semester began.',
        'I refactored my side project\'s cart logic entirely after this session.',
      ],
      tags: ['React', 'state management', 'architecture'],
      project: {
        title: 'Shopping Cart Refactor',
        imageUrl:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=380&fit=crop&auto=format',
        description:
          'Before/after component tree with documented rationale for each state placement decision.',
        link: 'https://github.com/example/cart-refactor',
      },
    },
    lines: [
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'Word for word. You were paying attention.',
      },
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'That principle scales. Architecture, databases, teams — the question is always "who needs to see this and when?"',
      },
      { speaker: 'Prof. Kim', character: DAVID, text: 'What else?' },
    ],
    next: 'webdev_intro',
  },

  webdev_r2: {
    id: 'webdev_r2',
    background:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0f0e2e',
    character: DAVID,
    reflection: {
      lessonNumber: 6,
      courseCode: 'CS 284',
      title: 'Database Design & Query Optimization',
      date: 'October 8, 2024',
      body: [
        'We ran EXPLAIN ANALYZE on queries from real student projects and the results were eye-opening. A query returning 40 rows was scanning 12,000. The fix was a composite index, but the lesson was about reading query plans as a diagnostic skill.',
        'I added this to my code review checklist immediately: any ORM query in a loop is a red flag worth investigating.',
        'The exercise surfaced how schema decisions made on day one propagate costs through an entire application\'s lifetime.',
      ],
      tags: ['PostgreSQL', 'indexing', 'query optimization'],
      project: {
        title: 'Query Optimization Case Study',
        imageUrl:
          'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&h=380&fit=crop&auto=format',
        description:
          'Before/after query plans for three real-world examples with documented index strategies.',
        link: 'https://example.com/query-opt',
      },
    },
    lines: [
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'Twelve thousand rows for forty results. That one still hurts to think about.',
      },
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'The best engineers I\'ve worked with read query plans like prose. It\'s a language.',
      },
      { speaker: 'Prof. Kim', character: DAVID, text: 'Go on.' },
    ],
    next: 'webdev_intro',
  },

  webdev_r3: {
    id: 'webdev_r3',
    background:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0f0e2e',
    character: DAVID,
    reflection: {
      lessonNumber: 11,
      courseCode: 'CS 284',
      title: 'Authentication, Sessions & Security',
      date: 'November 5, 2024',
      body: [
        'Implementing JWT authentication from primitives rather than a library was deliberately uncomfortable. Token expiry, refresh rotation, storage trade-offs between localStorage and httpOnly cookies, and CSRF implications for each choice.',
        'The most durable insight: security decisions aren\'t configuration, they\'re design. Choosing where to store a token affects every subsequent decision about how sessions work and what "logout" means.',
        'These decisions don\'t belong in a utility file — they belong in an architectural discussion.',
      ],
      tags: ['security', 'JWT', 'authentication'],
      project: {
        title: 'Auth System Implementation',
        imageUrl:
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=380&fit=crop&auto=format',
        description:
          'Full auth implementation with refresh rotation, covering five security failure modes.',
        link: 'https://github.com/example/auth-impl',
      },
    },
    lines: [
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'Good. Most students finish that unit thinking about tokens. You finished it thinking about decisions.',
      },
      {
        speaker: 'Prof. Kim',
        character: DAVID,
        text: 'That difference is the whole thing.',
      },
      { speaker: 'Prof. Kim', character: DAVID, text: 'Anything else?' },
    ],
    next: 'webdev_intro',
  },

  // ── RESEARCH INTRO ────────────────────────────────────────────
  research_intro: {
    id: 'research_intro',
    background:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0e1f17',
    character: ANYA,
    lines: [
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'Sit down. I was hoping someone would stop by.',
      },
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'Research methods is a course that takes a while to land. Sometimes years.',
      },
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'What\'s something you\'ve been turning over?',
      },
    ],
    choices: [
      {
        label: '"There\'s no view from nowhere. Every method encodes an assumption."',
        next: 'research_r1',
      },
      {
        label: '"The difference between a code and an interpretation. I think I finally see it."',
        next: 'research_r2',
      },
      { label: '"I learned a great deal. Thank you, Prof. Obi."', next: 'hub' },
    ],
  },

  research_r1: {
    id: 'research_r1',
    background:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0e1f17',
    character: ANYA,
    reflection: {
      lessonNumber: 3,
      courseCode: 'SOC 210',
      title: 'Survey Design & Sampling Bias',
      date: 'September 17, 2024',
      body: [
        'We reviewed a survey used by a real nonprofit to measure program satisfaction. It looked clean on the surface. Then we mapped who could access it (English-only, online-only), traced how questions anchored on earlier answers, and noticed the five-point scale forced respondents to round their actual experience.',
        'Bias wasn\'t in any single decision — it accumulated across dozens of small choices that each seemed neutral.',
        '"There is no view from nowhere." Every methodological choice encodes an assumption.',
      ],
      tags: ['survey design', 'sampling bias', 'methodology'],
      project: {
        title: 'Nonprofit Survey Audit',
        imageUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=380&fit=crop&auto=format',
        description:
          'Annotated critique of a program evaluation survey with redesigned instrument.',
        link: 'https://example.com/survey-audit',
      },
    },
    lines: [
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: '"No view from nowhere." You remember that.',
      },
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'The survey looked clean. That\'s the most dangerous kind of bias — invisible, accumulated, structurally necessary.',
      },
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'What else have you been sitting with?',
      },
    ],
    next: 'research_intro',
  },

  research_r2: {
    id: 'research_r2',
    background:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0e1f17',
    character: ANYA,
    reflection: {
      lessonNumber: 7,
      courseCode: 'SOC 210',
      title: 'Qualitative Coding & Thematic Analysis',
      date: 'October 15, 2024',
      body: [
        'We coded twenty interview transcripts about remote work using open coding, then collapsed individual codes into axial categories in small groups. What emerged looked nothing like what I expected — social isolation was almost never about physical distance, it was about loss of informal information flow.',
        'The exercise forced a kind of epistemic discipline I don\'t often practice: I had to distinguish between a code that described what a participant said and an interpretation I was layering onto it.',
        'That distinction — data versus inference — is going to follow me into every analysis I write.',
      ],
      tags: ['qualitative research', 'thematic analysis', 'coding'],
      project: {
        title: 'Remote Work Thematic Analysis',
        imageUrl:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=380&fit=crop&auto=format',
        description:
          'Codebook and theme map from 20 interviews, with analytical memo documenting interpretive decisions.',
      },
    },
    lines: [
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'Data versus inference. That\'s the whole discipline in three words.',
      },
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'Most people never stop to notice where the observation ends and the story begins.',
      },
      {
        speaker: 'Prof. Obi',
        character: ANYA,
        text: 'Anything else?',
      },
    ],
    next: 'research_intro',
  },

  // ── ETHICS INTRO ──────────────────────────────────────────────
  ethics_intro: {
    id: 'ethics_intro',
    background:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0a0f1e',
    character: LARS,
    lines: [
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'Ah. You came back.',
      },
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'I always wonder, at the end of semester, which students will have found this course unsettling — in the productive sense.',
      },
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'Tell me something you can\'t unknow.',
      },
    ],
    choices: [
      {
        label: '"An algorithmic system is a policy. That reframe changed everything for me."',
        next: 'ethics_r1',
      },
      {
        label: '"Consent frameworks built for clinical trials don\'t translate to platforms. They describe a fiction."',
        next: 'ethics_r2',
      },
      { label: '"I need to keep moving. Thank you, Prof. Eriksen."', next: 'hub' },
    ],
  },

  ethics_r1: {
    id: 'ethics_r1',
    background:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0a0f1e',
    character: LARS,
    reflection: {
      lessonNumber: 2,
      courseCode: 'PHIL 320',
      title: 'Algorithmic Fairness & Competing Definitions',
      date: 'September 11, 2024',
      body: [
        'The COMPAS case study demonstrated that technical solutions don\'t resolve value conflicts — they operationalize one value and suppress others. Northpointe\'s algorithm satisfied calibration fairness but violated equalized opportunity.',
        'No weighting scheme solves this. You have to choose what you\'re optimizing for, and that choice belongs to humans and institutions, not engineers.',
        '"An algorithmic system is a policy." That reframe is one of the most useful things I encountered this semester.',
      ],
      tags: ['algorithmic fairness', 'COMPAS', 'ethics'],
      project: {
        title: 'Fairness Metrics Analysis',
        imageUrl:
          'https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?w=600&h=380&fit=crop&auto=format',
        description:
          'Technical comparison of six fairness metrics applied to the COMPAS dataset with normative analysis.',
        link: 'https://example.com/fairness-metrics',
      },
    },
    lines: [
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'Good. You remember the reframe.',
      },
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'Every time someone tells you a system is "just" doing math — you\'ll know what to ask next.',
      },
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'Anything else weighing on you?',
      },
    ],
    next: 'ethics_intro',
  },

  ethics_r2: {
    id: 'ethics_r2',
    background:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0a0f1e',
    character: LARS,
    reflection: {
      lessonNumber: 5,
      courseCode: 'PHIL 320',
      title: 'Consent, Data, and the Limits of Transparency',
      date: 'October 2, 2024',
      body: [
        'We read the full Facebook data policy alongside a clinical research consent form. Clinical consent specifies what data is collected, how it\'s stored, who has access, for how long, and what the participant can withdraw.',
        'The data policy uses futures tense throughout, reserves the right to change, and defines "use" broadly enough to include derivatives of derivatives of your data.',
        'Any ethical framework that treats a platform and a user as equal contracting parties at consent time is describing a fiction.',
      ],
      tags: ['consent', 'data ethics', 'privacy'],
      project: {
        title: 'Consent Framework Comparison',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=380&fit=crop&auto=format',
        description:
          'Side-by-side analysis of clinical consent protocols versus platform data agreements.',
      },
    },
    lines: [
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: '"A fiction." Precise word. Generous, even.',
      },
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'The asymmetry you named isn\'t incidental. It\'s the business model.',
      },
      {
        speaker: 'Prof. Eriksen',
        character: LARS,
        text: 'Is there anything else before you go?',
      },
    ],
    next: 'ethics_intro',
  },

  // ── ENDING ────────────────────────────────────────────────────
  ending: {
    id: 'ending',
    background:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&h=900&fit=crop&auto=format',
    bgColor: '#0f0e17',
    lines: [
      { text: 'You step back out into the late-afternoon light.' },
      { text: 'The semester doesn\'t feel finished, exactly. More like — opened.' },
      {
        text: 'Empathy mapping. Paper prototypes. Query plans. Fairness metrics. Consent forms that describe a fiction.',
      },
      {
        text: 'You close the notebook. Not because you\'re done, but because you finally know what questions to keep asking.',
      },
      { text: '— End of Semester —' },
    ],
    isEnding: true,
  },
}
