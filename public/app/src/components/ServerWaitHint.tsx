import { useEffect, useState } from 'react';

const STAGES = [
  { after: 0, text: '' },
  { after: 4_000, text: 'Conectando ao servidor' },
  { after: 10_000, text: 'Acordando o servidor. Na primeira vez do dia isso pode levar até 1 minuto' },
  { after: 35_000, text: 'Quase lá, buscando seus dados' },
];

/**
 * Aviso progressivo enquanto o backend (Render free) acorda, para a espera não
 * parecer erro ou travamento. Tem relógio próprio: só ele re-renderiza.
 */
export default function ServerWaitHint({ active }: { active: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const startedAt = Date.now();
    const timer = window.setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const stage = [...STAGES].reverse().find((item) => elapsed >= item.after) ?? STAGES[0];
  if (!active || !stage.text) return null;

  return (
    <div className="server-wait-hint" role="status" aria-live="polite">
      <span className="server-wait-text">
        {stage.text}
        <span className="server-wait-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>
      </span>
      <span className="server-wait-bar" aria-hidden="true"><span /></span>
    </div>
  );
}
