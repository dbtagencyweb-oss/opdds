import { useEffect, useRef, useState } from 'react';

type TrialCountdownProps = {
  endsAt: string | null;
  /** clock: 71:59:58 · short: 72h (ou 45min na última hora) */
  format?: 'clock' | 'short';
  onExpire?: () => void;
};

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Contador da degustação do iGentMIND. Tem o próprio relógio para que só ele
 * re-renderize a cada segundo, não o App inteiro.
 */
export default function TrialCountdown({ endsAt, format = 'clock', onExpire }: TrialCountdownProps) {
  const [now, setNow] = useState(() => Date.now());
  const expiredRef = useRef(false);
  const endsAtMs = endsAt ? new Date(endsAt).getTime() : null;

  useEffect(() => {
    if (endsAtMs == null) return;
    const timer = window.setInterval(() => setNow(Date.now()), format === 'clock' ? 1000 : 30_000);
    return () => window.clearInterval(timer);
  }, [endsAtMs, format]);

  const msLeft = endsAtMs == null ? 72 * 3_600_000 : Math.max(0, endsAtMs - now);

  useEffect(() => {
    if (endsAtMs != null && msLeft === 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
    }
  }, [endsAtMs, msLeft, onExpire]);

  const totalSeconds = Math.floor(msLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (format === 'short') {
    return <>{hours >= 1 ? `${Math.ceil(msLeft / 3_600_000)}h` : `${Math.max(1, minutes)}min`}</>;
  }

  return (
    <span className="trial-clock" role="timer" aria-label={`${hours} horas e ${minutes} minutos restantes`}>
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}
