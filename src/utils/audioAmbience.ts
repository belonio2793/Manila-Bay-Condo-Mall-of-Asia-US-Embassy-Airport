/**
 * Web Audio Ambient Sound Synthesizer
 * Provides soothing high-rise tropical sea breeze and warm sunset ambient pad
 */

class AudioAmbienceController {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private start() {
    if (!this.ctx) return;

    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 2.5);
      this.masterGain.connect(this.ctx.destination);

      // Pink noise buffer for ocean sea breeze
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Low pass filter for gentle deep wind whisper
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.noiseNode.connect(filter);
      filter.connect(this.masterGain);
      this.noiseNode.start();

      // Warm harmonic sine pad for subtle luxury ambiance (D minor 9th harmonic)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3

      const oscGain1 = this.ctx.createGain();
      oscGain1.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.osc1.connect(oscGain1);
      oscGain1.connect(this.masterGain);
      this.osc1.start();

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(220.00, this.ctx.currentTime); // A3

      const oscGain2 = this.ctx.createGain();
      oscGain2.gain.setValueAtTime(0.03, this.ctx.currentTime);
      this.osc2.connect(oscGain2);
      oscGain2.connect(this.masterGain);
      this.osc2.start();

      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
    }
  }

  private stop() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        try {
          this.noiseNode?.stop();
          this.osc1?.stop();
          this.osc2?.stop();
        } catch {
          // ignore
        }
        this.noiseNode = null;
        this.osc1 = null;
        this.osc2 = null;
        this.isPlaying = false;
      }, 1200);
    } catch {
      this.isPlaying = false;
    }
  }
}

export const audioAmbience = new AudioAmbienceController();
