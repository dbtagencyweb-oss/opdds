import { useEffect, useRef } from 'react';
import SiriWave from '../vendor/siriwave.esm.min.js';

type Props = {
  active: boolean;
  intensity?: number;
};

export default function SiriWaveVisualizer({ active, intensity = 1 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<SiriWave | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createWave = () => {
      waveRef.current?.dispose();
      const bounds = container.getBoundingClientRect();
      waveRef.current = new SiriWave({
        container,
        style: 'ios9',
        width: Math.max(260, Math.round(bounds.width || 520)),
        height: Math.max(30, Math.round(bounds.height || 34)),
        autostart: true,
        speed: active ? 0.28 : 0.055,
        amplitude: active ? 1.7 * intensity : 0.18,
        pixelDepth: 0.08,
        lerpSpeed: 0.08,
        globalCompositeOperation: 'lighter',
        curveDefinition: [
          { color: '255,255,255', supportLine: true },
          { color: '239,220,162' },
          { color: '215,183,88' },
          { color: '72,220,210' },
          { color: '120,105,255' },
        ],
        ranges: {
          noOfCurves: [6, 9],
          amplitude: [0.9, 2.05],
          width: [0.035, 0.105],
          speed: [0.14, 0.38],
          offset: [-0.22, 0.22],
          despawnTimeout: [420, 1250],
        },
      });
    };

    createWave();
    const resizeObserver = new ResizeObserver(createWave);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      waveRef.current?.dispose();
      waveRef.current = null;
    };
  }, []);

  useEffect(() => {
    waveRef.current?.setAmplitude(active ? Math.max(1.05, Math.min(2.85, intensity * 1.22)) : 0.18);
    waveRef.current?.setSpeed(active ? 0.3 : 0.055);
  }, [active, intensity]);

  return <div ref={containerRef} className={`siriwave-visualizer ${active ? 'active' : ''}`} aria-hidden="true" />;
}
