export type CommentQuestion = {
  id: string;
  question: string;
  shortLabel: string;
  inputType: 'text' | 'choice' | 'multiChoice';
  placeholder?: string;
  options?: string[];
  responseKey: keyof CommentChatResponses;
  sectionIntroBefore?: string;
  sectionClosingAfter?: string;
};

export type CommentChatPhase =
  | 'category'
  | 'response'
  | 'sectionContinue'
  | 'complete'
  | 'editMenu'
  | 'editCategory'
  | 'editResponse'
  | 'typing'
  | 'submitted';

export type CommentChatMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  tone?: 'typing' | 'error';
};

export type CommentChatSubmitResult = {
  ok: boolean;
  error?: string;
};

export type CommentChatResponses = {
  lapdMainLearnings: string;
  lapdAssessmentClarityMeaningRelevance: string;
  lapdImprovement: string;
  assessmentLearningGuidance: string;
  assessmentProgressionTrack: string;
  assessmentClarityConcerns: string;
  assessmentImprovement: string;
  teachingFormatPreference: string;
  f2fTeachingValue: string;
  onlineTeachingValue: string;
  teachingFormatDecisionFactors: string;
  surveyMethodPreference: string;
};

// Blank lines ("\n\n") in `question` and `sectionIntroBefore` split the text
// into separate chat bubbles; single "\n" breaks lines within one bubble.
export const commentChatQuestions: CommentQuestion[] = [
  {
    id: 'lapd-main-learnings',
    question: 'What are your main learnings from the Leadership & Professional Development-stream?',
    shortLabel: 'LAPD · Q1',
    inputType: 'text',
    placeholder: 'Skills, concepts, or activities',
    responseKey: 'lapdMainLearnings',
    sectionIntroBefore:
      "First, I'd like to ask about the Leadership & Professional Development-stream.\n\nThis section has 3 questions.",
  },
  {
    id: 'lapd-assessment-clarity',
    question: 'How clear, meaningful and relevant were the various LAPD-assessments?',
    shortLabel: 'LAPD · Q2',
    inputType: 'text',
    placeholder: 'Clarity, relevance, or workload',
    responseKey: 'lapdAssessmentClarityMeaningRelevance',
  },
  {
    id: 'lapd-improvement',
    question: 'How can we further improve LAPD?',
    shortLabel: 'LAPD · Q3',
    inputType: 'text',
    placeholder: 'What could be improved?',
    responseKey: 'lapdImprovement',
    sectionClosingAfter: 'Thank you so much for your insights!',
  },
  {
    id: 'assessment-learning-guidance',
    question: 'How do the various assessments throughout the year guide your learning?',
    shortLabel: 'Assessment · Q1',
    inputType: 'text',
    placeholder: 'Strengths, gaps, or next steps',
    responseKey: 'assessmentLearningGuidance',
    sectionIntroBefore:
      "Now, I'd like to ask a few questions about assessment.\n\nThis section has 4 questions.",
  },
  {
    id: 'assessment-progression-track',
    question: 'How do you know if you are on track for progression?',
    shortLabel: 'Assessment · Q2',
    inputType: 'text',
    placeholder: 'How do you know you are on track?',
    responseKey: 'assessmentProgressionTrack',
  },
  {
    id: 'assessment-clarity-concerns',
    question:
      "Clarity of assessment has been a concern.\n\nAre there any assessments so far in Year 2 where you didn't know what to expect and/or what was required of you?\nPlease select all that apply.",
    shortLabel: 'Assessment · Q3',
    inputType: 'multiChoice',
    options: [
      'No, all were clear',
      'Mini-Cex',
      'DOPS',
      'CSBL discussion summary',
      'CAT',
      'Access to Healthcare assignment',
      'Coaching & Professional Development Review',
      'GP placement-associated assessments',
      'Collaborative Care/Outpatients poster',
      'Cultural Humility Journal',
      'Other',
    ],
    responseKey: 'assessmentClarityConcerns',
  },
  {
    id: 'assessment-improvement',
    question:
      'How can we improve your understanding of the expectations and requirements for each of these assessments?',
    shortLabel: 'Assessment · Q4',
    inputType: 'text',
    placeholder: 'Timing, workload, or feedback',
    responseKey: 'assessmentImprovement',
    sectionClosingAfter: 'Wonderful! Thanks for sharing your thoughts.',
  },
  {
    id: 'f2f-teaching-value',
    question: 'What do you value about face-to-face teaching?',
    shortLabel: 'F2F/Online · Q1',
    inputType: 'text',
    placeholder: 'Interaction, practice, or discussion',
    responseKey: 'f2fTeachingValue',
    sectionIntroBefore:
      'A few final questions.\n\nThe course team is looking to optimise the balance between face-to-face and online teaching.\n\nThis section has 4 questions.',
  },
  {
    id: 'online-teaching-value',
    question: 'What do you value about online teaching?',
    shortLabel: 'F2F/Online · Q2',
    inputType: 'text',
    placeholder: 'Flexibility, access, or revision',
    responseKey: 'onlineTeachingValue',
  },
  {
    id: 'teaching-format-preference',
    question:
      'For lectures and workshops, do you generally prefer face-to-face or online classes for lectures and workshops?',
    shortLabel: 'F2F/Online · Q3',
    inputType: 'choice',
    options: ['Face-to-Face classes', 'Online classes'],
    responseKey: 'teachingFormatPreference',
  },
  {
    id: 'teaching-format-decision-factors',
    question:
      'What should the course team consider when deciding whether classes should be online vs face to face?',
    shortLabel: 'F2F/Online · Q4',
    inputType: 'text',
    placeholder: 'Activity type, purpose, or workload',
    responseKey: 'teachingFormatDecisionFactors',
    sectionClosingAfter: 'Thanks again for your input!',
  },
  {
    id: 'survey-method-preference',
    question:
      'Do you prefer this chatbot-style survey method compared with a traditional survey form?',
    shortLabel: 'Survey method',
    inputType: 'choice',
    options: ['Yes', 'No'],
    responseKey: 'surveyMethodPreference',
  },
];

export const typingDelay = 1000;

export function createInitialCommentChatResponses(): CommentChatResponses {
  return {
    lapdMainLearnings: '',
    lapdAssessmentClarityMeaningRelevance: '',
    lapdImprovement: '',
    assessmentLearningGuidance: '',
    assessmentProgressionTrack: '',
    assessmentClarityConcerns: '',
    assessmentImprovement: '',
    teachingFormatPreference: '',
    f2fTeachingValue: '',
    onlineTeachingValue: '',
    teachingFormatDecisionFactors: '',
    surveyMethodPreference: '',
  };
}
