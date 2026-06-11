declare module './siriwave.esm.min.js' {
  type SiriWaveOptions = {
    container: HTMLElement;
    style?: 'ios' | 'ios9';
    width?: number;
    height?: number;
    speed?: number;
    amplitude?: number;
    autostart?: boolean;
    cover?: boolean;
    pixelDepth?: number;
    lerpSpeed?: number;
    globalCompositeOperation?: GlobalCompositeOperation;
    curveDefinition?: Array<{ supportLine?: boolean; color: string }>;
    ranges?: {
      noOfCurves?: [number, number];
      amplitude?: [number, number];
      offset?: [number, number];
      width?: [number, number];
      speed?: [number, number];
      despawnTimeout?: [number, number];
    };
  };

  export default class SiriWave {
    constructor(options: SiriWaveOptions);
    start(): void;
    stop(): void;
    dispose(): void;
    setSpeed(value: number): void;
    setAmplitude(value: number): void;
  }
}
