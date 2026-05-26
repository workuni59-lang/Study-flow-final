export interface TemplateTopic {
  title: string;
}

export interface SubjectTemplate {
  id: string;
  name: string;
  color: string;
  topics: string[];
}

export const SUBJECT_TEMPLATES: SubjectTemplate[] = [
  {
    id: 'lsat',
    name: 'LSAT Preparation',
    color: 'indigo',
    topics: [
      'Logical Reasoning: Arguments',
      'Logical Reasoning: Assumptions',
      'Analytical Reasoning: Logic Games',
      'Reading Comprehension: Science',
      'Reading Comprehension: Law',
      'Reading Comprehension: Humanities',
      'Writing Sample Strategy'
    ]
  },
  {
    id: 'gre',
    name: 'GRE General Test',
    color: 'rose',
    topics: [
      'Verbal: Text Completion',
      'Verbal: Sentence Equivalence',
      'Verbal: Reading Comprehension',
      'Quant: Arithmetic & Algebra',
      'Quant: Geometry',
      'Quant: Data Analysis',
      'Analytical Writing: Issue Task',
      'Analytical Writing: Argument Task'
    ]
  },
  {
    id: 'mcat',
    name: 'MCAT: Biological Sciences',
    color: 'emerald',
    topics: [
      'Biochemistry: Protein Structure',
      'Biology: Cell Division',
      'Biology: Genetics',
      'Biology: Organ Systems',
      'Chemistry: Organic Reactions',
      'Chemistry: Thermodynamics',
      'Physics: Optics and Light',
      'CARS: Analysis and Reasoning'
    ]
  },
  {
    id: 'sat',
    name: 'SAT: Math & English',
    color: 'cyan',
    topics: [
      'Reading: Command of Evidence',
      'Writing: Standard English',
      'Math: Heart of Algebra',
      'Math: Passport to Advanced Math',
      'Math: Data Analysis',
      'Math: Geometry & Trig'
    ]
  },
  {
    id: 'final-exam-math',
    name: 'Calculus: Final Review',
    color: 'amber',
    topics: [
      'Limits and Continuity',
      'Differentiation Rules',
      'Applications of Derivatives',
      'Integrals: Fundamental Theorem',
      'Integration Techniques',
      'Sequences and Series'
    ]
  }
];
