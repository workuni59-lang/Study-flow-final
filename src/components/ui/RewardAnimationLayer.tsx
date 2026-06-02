import { useState, useEffect, useRef, useCallback } from 'react';
import { useStudy } from '../../context/StudyContext';
import { CoinBurst, XpFloat, FloatingReward } from './ReactionOverlay';
import LevelUpSequence from './LevelUpSequence';

interface Reward {
  id: number;
  type: 'coins' | 'xp' | 'floating' | 'level_up' | 'evolution';
  x?: number;
  y?: number;
  amount?: number;
  emoji?: string;
  text?: string;
  duration: number;
}

export default function RewardAnimationLayer() {
  const { petEvent, levelUpEvent, dismissLevelUp } = useStudy();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const prevEventId = useRef(0);
  const idRef = useRef(0);

  const dismissReward = useCallback((id: number) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  }, []);

  useEffect(() => {
    if (!petEvent || petEvent.id === prevEventId.current) return;
    prevEventId.current = petEvent.id;

    const newRewards: Reward[] = [];

    switch (petEvent.type) {
      case 'task_done':
        idRef.current++;
        newRewards.push({
          id: idRef.current,
          type: 'coins',
          duration: 1200,
        });
        idRef.current++;
        newRewards.push({
          id: idRef.current,
          type: 'xp',
          amount: 50,
          duration: 1200,
        });
        break;
      case 'focus_done':
        idRef.current++;
        newRewards.push({
          id: idRef.current,
          type: 'coins',
          duration: 1200,
        });
        idRef.current++;
        newRewards.push({
          id: idRef.current,
          type: 'xp',
          amount: 100,
          duration: 1200,
        });
        idRef.current++;
        newRewards.push({
          id: idRef.current,
          type: 'floating',
          emoji: '🧠',
          text: 'Session Complete!',
          duration: 2000,
        });
        break;
      case 'achievement_unlocked':
        idRef.current++;
        newRewards.push({
          id: idRef.current,
          type: 'floating',
          emoji: '🏆',
          text: 'Achievement!',
          duration: 2500,
        });
        break;
      case 'streak_milestone':
        idRef.current++;
        newRewards.push({
          id: idRef.current,
          type: 'floating',
          emoji: '🔥',
          text: 'Streak!',
          duration: 2000,
        });
        break;
    }

    if (newRewards.length > 0) {
      setRewards(prev => [...prev, ...newRewards]);
    }
  }, [petEvent]);

  const showLevelUp = levelUpEvent !== null;

  return (
    <>
      {/* Coin/Xp/Floating rewards */}
      {rewards.map(r => (
        <div key={r.id} className="fixed inset-0 z-[9998] pointer-events-none">
          {r.type === 'coins' && (
            <CoinBurst count={5} onComplete={() => dismissReward(r.id)} />
          )}
          {r.type === 'xp' && (
            <XpFloat amount={r.amount ?? 50} x={40} y={50} onComplete={() => dismissReward(r.id)} />
          )}
          {r.type === 'floating' && (
            <FloatingReward
              emoji={r.emoji ?? '✨'}
              text={r.text ?? ''}
              onComplete={() => dismissReward(r.id)}
            />
          )}
        </div>
      ))}

      {/* Level-up overlay */}
      {showLevelUp && (
        <LevelUpSequence
          level={levelUpEvent}
          isOpen={showLevelUp}
          onComplete={() => dismissLevelUp()}
        />
      )}
    </>
  );
}
