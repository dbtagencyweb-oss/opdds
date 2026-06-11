import { Play } from 'lucide-react';
import Button from './Button';

type Props = {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onPlayAudio: () => void;
  onNext: () => void;
  onSkip: () => void;
  isPlaying?: boolean;
};

export default function OnboardingModal({
  step,
  totalSteps,
  title,
  description,
  onPlayAudio,
  onNext,
  onSkip,
  isPlaying = false,
}: Props) {
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md rounded-lg border border-[#c8a45d]/45 bg-[#18191d] p-7 shadow-2xl animate-slide-up">
        <p className="kicker">Passo {step}/{totalSteps}</p>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-white">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-zinc-300">{description}</p>

        <div className="mt-8 space-y-3">
          <button
            onClick={onPlayAudio}
            className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
          >
            <span className="text-sm font-medium">Ouvir explicação</span>
            <Play size={16} className={isPlaying ? 'animate-pulse' : ''} />
          </button>
          <Button onClick={onNext} className="w-full">Continuar</Button>
        </div>

        <div className="mt-6 space-y-2">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-zinc-500">{step} de {totalSteps}</p>
        </div>

        <button onClick={onSkip} className="mt-6 text-xs text-zinc-500 underline transition hover:text-zinc-300">
          Pular boas-vindas
        </button>
      </div>
    </div>
  );
}
