import { useState, useEffect } from 'react';
import { sync } from '../../services/sync';
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';

export const SyncStatus = () => {
  const [pending, setPending] = useState(0);
  const [deadLetter, setDeadLetter] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const check = () => {
      setPending(sync.pendingCount);
      setDeadLetter(sync.deadLetterCount);
      setOnline(sync.online);
    };
    check();
    const id = setInterval(check, 2000);
    return () => clearInterval(id);
  }, []);

  if (!sync.userId) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <div
        title={online ? `${pending} pending sync` : 'Offline'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          height: '24px',
          padding: '0 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 600,
          color: online ? 'rgba(255,255,255,0.5)' : 'rgba(239,68,68,0.7)',
          background: online ? 'rgba(255,255,255,0.04)' : 'rgba(239,68,68,0.08)',
        }}
      >
        {online ? (
          pending > 0 ? (
            <>
              <RefreshCw size={10} className="animate-spin" />
              <span>{pending}</span>
            </>
          ) : (
            <Cloud size={10} />
          )
        ) : (
          <CloudOff size={10} />
        )}
      </div>
      {deadLetter > 0 && (
        <button
          title={`${deadLetter} failed syncs. Click to retry.`}
          onClick={() => sync.retryDeadLetters()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            height: '24px',
            padding: '0 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 600,
            color: 'rgba(251,191,36,0.8)',
            background: 'rgba(251,191,36,0.1)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <AlertTriangle size={10} />
          <span>{deadLetter}</span>
        </button>
      )}
    </div>
  );
};