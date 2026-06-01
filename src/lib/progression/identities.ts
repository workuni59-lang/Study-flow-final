export interface RankIdentity {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  emotionalTone: string;
  visualTheme: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  levelRange: string;
}

export const RANK_IDENTITIES: RankIdentity[] = [
  {
    id: 1,
    title: 'Novice Learner',
    subtitle: 'The Journey Begins',
    description: 'Every master was once a beginner. This is where your study journey starts—every session builds the foundation for greatness.',
    emotionalTone: 'Hopeful and determined. You are taking the first steps toward a disciplined mind.',
    visualTheme: 'Soft dawn light, sprouting seeds, warm earthy tones.',
    color: '#8B7E6B',
    gradientFrom: '#A08F7A',
    gradientTo: '#6B5E4E',
    levelRange: '1 — 4',
  },
  {
    id: 2,
    title: 'Dedicated Student',
    subtitle: 'Consistency Takes Root',
    description: 'You have shown up, again and again. Consistency is the quiet engine of all great achievement—and you are building it.',
    emotionalTone: 'Steady and grounded. You are proving to yourself that discipline is a habit you can grow.',
    visualTheme: 'Morning light through library windows, growing saplings, calm blues and greens.',
    color: '#5B8C7A',
    gradientFrom: '#6BA08A',
    gradientTo: '#3A6B58',
    levelRange: '5 — 9',
  },
  {
    id: 3,
    title: 'Knowledge Seeker',
    subtitle: 'The Hunt for Understanding',
    description: 'Curiosity drives your growth. You no longer just study—you seek. Every answer found leads to a better question.',
    emotionalTone: 'Curious and energized. Learning feels like exploration, not obligation.',
    visualTheme: 'Compasses, open maps, warm amber tones, the feeling of discovery.',
    color: '#B88A44',
    gradientFrom: '#D4A054',
    gradientTo: '#8A6630',
    levelRange: '10 — 14',
  },
  {
    id: 4,
    title: 'Focus Practitioner',
    subtitle: 'The Art of Attention',
    description: 'Focus is not gifted—it is forged. You have trained your mind to concentrate deeply, turning scattered moments into productive flow.',
    emotionalTone: 'Confident and sharp. You have learned that focus is a skill, and you are mastering it.',
    visualTheme: 'Converging light beams, crystalline structures, cool indigo and violet tones.',
    color: '#6B5B9E',
    gradientFrom: '#8070B4',
    gradientTo: '#4A3E7A',
    levelRange: '15 — 19',
  },
  {
    id: 5,
    title: 'Academic Explorer',
    subtitle: 'Beyond the Horizon',
    description: 'You have moved beyond assignments into genuine exploration. Your learning is self-directed, passionate, and unbounded.',
    emotionalTone: 'Adventurous and inspired. You are charting your own intellectual territory.',
    visualTheme: 'Compass roses, horizon lines, rich navy and gold, explorer aesthetics.',
    color: '#2C5F7C',
    gradientFrom: '#3A7A9E',
    gradientTo: '#1A4056',
    levelRange: '20 — 29',
  },
  {
    id: 6,
    title: 'Elite Scholar',
    subtitle: 'Discipline Made You',
    description: 'You have built serious study discipline. Your habits are refined, your mind is sharp, and your results speak for themselves.',
    emotionalTone: 'Proud and accomplished. Your hard work has shaped you into someone exceptional.',
    visualTheme: 'Trophy finishes, polished metals, deep crimson and gold, championship aesthetics.',
    color: '#9A2A2A',
    gradientFrom: '#C03535',
    gradientTo: '#701E1E',
    levelRange: '30 — 39',
  },
  {
    id: 7,
    title: 'Master Researcher',
    subtitle: 'Depth Beyond Measure',
    description: 'You do not just learn—you research, analyze, and synthesize. Your understanding runs deeper than most will ever reach.',
    emotionalTone: 'Respected and wise. Others look to you as a source of knowledge and insight.',
    visualTheme: 'Crystalline depths, refined gemstones, deep purples and silver, premium elegance.',
    color: '#5A3A7A',
    gradientFrom: '#74509E',
    gradientTo: '#3E2456',
    levelRange: '40 — 49',
  },
  {
    id: 8,
    title: 'Grand Academic',
    subtitle: 'A Pillar of Learning',
    description: 'You have become a pillar of the learning community. Your dedication inspires others, and your knowledge strengthens everyone around you.',
    emotionalTone: 'Noble and generous. Your achievements are not just personal—they elevate others.',
    visualTheme: 'Crown motifs, grand halls, royal blues and gold, majestic elegance with warmth.',
    color: '#2A5080',
    gradientFrom: '#3A6AA0',
    gradientTo: '#1A345A',
    levelRange: '50 — 69',
  },
  {
    id: 9,
    title: 'Legendary Scholar',
    subtitle: 'Echoes of Excellence',
    description: 'Your dedication echoes through time. You are a role model for every learner who dreams of reaching your heights.',
    emotionalTone: 'Humble yet legendary. Your journey has become a story that inspires others to begin theirs.',
    visualTheme: 'Starlight, cosmic radiance, deep space blues and radiant gold, transcendent beauty.',
    color: '#6B4A2A',
    gradientFrom: '#8A6A3A',
    gradientTo: '#4A301A',
    levelRange: '70 — 99',
  },
  {
    id: 10,
    title: 'Study Titan',
    subtitle: 'You Define Excellence',
    description: 'Beyond mastery—you define what excellence means. The limits that hold others back simply do not exist for you.',
    emotionalTone: 'Transcendent and iconic. You have become the standard by which dedication is measured.',
    visualTheme: 'Solar radiance, phoenix fire, blazing orange and gold, ultimate prestige.',
    color: '#C04020',
    gradientFrom: '#E86030',
    gradientTo: '#8A2A10',
    levelRange: '100+',
  },
];

export const getIdentity = (rankId: number): RankIdentity =>
  RANK_IDENTITIES.find(r => r.id === rankId) || RANK_IDENTITIES[0];
