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
        width: Math.max(120, Math.round(bounds.width || 180)),
        height: Math.max(42, Math.round(bounds.height || 56)),
        autostart: true,
        speed: active ? 0.24 : 0.055,
        amplitude: active ? 1.45 * intensity : 0.16,
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
          noOfCurves: [5, 8],
          amplitude: [0.75, 1.65],
          width: [0.045, 0.12],
          speed: [0.12, 0.34],
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
    waveRef.current?.setAmplitude(active ? Math.max(0.9, Math.min(2.45, intensity)) : 0.16);
    waveRef.current?.setSpeed(active ? 0.26 : 0.055);
  }, [active, intensity]);

  return <div ref={containerRef} className={`siriwave-visualizer ${active ? 'active' : ''}`} aria-hidden="true" />;
}
