import { Timer, Brain, Mountain, Music, Sparkles, Target, Clock, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: Timer,
    title: 'Customizable Sessions',
    body: 'Set your own focus and break intervals — Pomodoro classic is 25 minutes, but everyone works differently. Maybe 45 minutes with a longer break is your sweet spot. Tweak it until it feels right.',
  },
  {
    icon: Brain,
    title: 'Deep Focus Mode',
    body: 'Longer, uninterrupted sessions for when you are in a flow state and a 25-minute block just doesn\'t cut it. No breaks, no interruptions — just you and your work.',
  },
  {
    icon: Mountain,
    title: 'Flow Mode',
    body: 'Adaptive timing that adjusts to how you are actually working. If you are locked in, the timer extends. If you are struggling, it eases up. Think of it as a co-pilot rather than a stopwatch.',
  },
  {
    icon: Music,
    title: 'Built-in Ambience',
    body: 'Rain on a window, a crackling fireplace, gentle lo-fi beats — sounds that fade into the background and keep you from noticing the silence. Choose what helps you disappear into the work.',
  },
  {
    icon: Sparkles,
    title: 'Gamified Rewards',
    body: 'Every completed session earns XP. Level up, unlock badges, collect achievements. It is not about the numbers — it is about turning consistency into a game you actually want to keep playing.',
  },
  {
    icon: Target,
    title: 'Task Integration',
    body: 'Attach a task to every focus session so you always know what you are working toward. Check it off when you are done. Small wins stack up faster than you think.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Pick your task',
    body: 'Decide what you want to work on. One thing. Not everything — just the next thing that matters.',
  },
  {
    number: '2',
    title: 'Set the timer',
    body: 'Choose a session length that matches your energy. Pomodoro, Deep Focus, Flow — or just go and let it run.',
  },
  {
    number: '3',
    title: 'Work until it rings',
    body: 'No distractions. No multi-tasking. Just the one thing you picked. The timer keeps you honest.',
  },
  {
    number: '4',
    title: 'Take a real break',
    body: 'Step away. Stretch. Breathe. Let your brain reset before the next round. You have earned it.',
  },
];

const MODES = [
  {
    name: 'Pomodoro',
    time: '25 / 5 min',
    desc: 'The classic rhythm. Short bursts of deep work followed by quick resets. Reliable, predictable, proven.',
  },
  {
    name: 'Deep Focus',
    time: '50 / 10 min',
    desc: 'Longer sessions for when you need to build momentum. Great for writing, coding, or anything that takes time to sink into.',
  },
  {
    name: 'Flow',
    time: 'Adaptive',
    desc: 'The timer learns from you. Extends when you are in the zone, steps back when you need a breather. No two sessions are the same.',
  },
  {
    name: 'Count Up',
    time: 'Unlimited',
    desc: 'No end time. Just start and see how long you can stay focused. Sometimes the best sessions are the ones you do not set a limit on.',
  },
];

export function PomodoroLanding() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      {/* Hero */}
      <section className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-xs font-semibold text-brand mb-6">
          <Clock className="w-3.5 h-3.5" />
          The Pomodoro Technique
        </div>
        <h1 className="text-4xl md:text-5xl font-bold dark:text-white tracking-tight mb-4 leading-tight">
          Work in sprints.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-violet-500">
            Rest like you mean it.
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          The Pomodoro Technique is deceptively simple: work for a set amount of time, take a short break,
          repeat. But underneath that simplicity is a powerful insight — your brain is not built for
          marathon focus sessions. It is built for sprints. Study Flow takes that idea and wraps it in
          tools, sounds, and rewards that actually make you want to sit down and start.
        </p>
        <Link
          to={ROUTES.FOCUS}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors shadow-lg shadow-brand/25"
        >
          Try the timer
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* How it works */}
      <section className="mb-20">
        <h2 className="text-xl font-bold dark:text-white text-center mb-10">How it works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-brand/10 text-brand text-sm font-bold flex items-center justify-center mx-auto mb-3">
                {step.number}
              </div>
              <h3 className="text-sm font-semibold dark:text-white mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why it works */}
      <section className="mb-20 bg-white/50 dark:bg-white/[0.02] rounded-2xl p-6 md:p-10 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold dark:text-white mb-4">Why it actually works</h2>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            The Pomodoro Technique was born in the late 1980s when a university student named Francesco
            Cirillo was struggling to focus. He grabbed a kitchen timer shaped like a tomato — pomodoro
            in Italian — and challenged himself to work for just ten minutes without distractions. That
            small experiment turned into one of the most widely used focus methods in the world.
          </p>
          <p>
            What makes it effective is not the timer itself — it is the psychological trick it plays on
            your brain. A 25-minute session feels manageable. It does not trigger the dread that comes
            with "I have to work for the next four hours." You are not committing to a marathon. You are
            just committing to one tomato.
          </p>
          <p>
            The breaks matter just as much. Short, deliberate pauses prevent mental fatigue and give your
            brain time to consolidate what you just learned. After four sessions, a longer break lets you
            reset completely. The rhythm keeps you from burning out while building real momentum over the
            course of a day.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mb-20">
        <h2 className="text-xl font-bold dark:text-white text-center mb-10">Study Flow makes it yours</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-5 rounded-xl bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                <f.icon className="w-4.5 h-4.5 text-brand" />
              </div>
              <h3 className="text-sm font-semibold dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timer modes */}
      <section className="mb-20">
        <h2 className="text-xl font-bold dark:text-white text-center mb-3">Find your rhythm</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-lg mx-auto mb-8">
          Pomodoro is a great starting point, but everyone works differently. These modes give you the
          flexibility to match your energy, your task, and your mood.
        </p>
        <div className="grid md:grid-cols-4 gap-3">
          {MODES.map((m) => (
            <div key={m.name} className="p-4 rounded-xl bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs font-semibold text-brand mb-0.5">{m.time}</div>
              <h3 className="text-sm font-bold dark:text-white mb-1.5">{m.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-brand/5 via-violet-500/5 to-transparent border border-brand/10">
        <h2 className="text-xl font-bold dark:text-white mb-3">Ready to try it?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          No sign-up required. Open the timer, pick a mode, and start your first session.
          The rest takes care of itself.
        </p>
        <Link
          to={ROUTES.FOCUS}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors shadow-lg shadow-brand/25"
        >
          Start your first session
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
