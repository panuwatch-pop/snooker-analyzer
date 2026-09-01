// Web Audio API sound synthesizer
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Load mute preference
    const saved = localStorage.getItem('snooker_sound_muted');
    if (saved !== null) {
      this.muted = JSON.parse(saved);
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('snooker_sound_muted', JSON.stringify(this.muted));
    return this.muted;
  }

  // Crisp snooker ball contact click
  public playPotSound(points: number = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High wooden click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Frequency slightly rises with ball value for satisfying acoustic feel
      const baseFreq = 800 + points * 120;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // Add a slight pocket thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(140, now + 0.04);
      thud.frequency.exponentialRampToValueAtTime(40, now + 0.16);

      thudGain.gain.setValueAtTime(0.25, now + 0.04);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      thud.connect(thudGain);
      thudGain.connect(ctx.destination);

      thud.start(now + 0.04);
      thud.stop(now + 0.17);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  // Foul buzzer tone
  public playFoulSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(140, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // ignore
    }
  }

  // Turn switch / end break subtle cue
  public playTurnSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(659, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // ignore
    }
  }

  // 50+ or Century break applause
  public playApplause(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Pink noise burst with envelope
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = white * Math.exp(-i / (ctx.sampleRate * 0.5)) * 0.15;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.0;

      whiteNoise.connect(filter);
      filter.connect(ctx.destination);

      whiteNoise.start();
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
