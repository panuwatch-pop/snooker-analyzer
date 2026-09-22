/**
 * Convert a number to Thai spoken words
 * e.g. 1 -> "หนึ่ง", 7 -> "เจ็ด", 15 -> "สิบห้า", 21 -> "ยี่สิบเอ็ด", 100 -> "หนึ่งร้อย"
 */
export function numberToThaiWords(num: number): string {
  if (isNaN(num)) return '';
  if (num === 0) return 'ศูนย์';
  if (num < 0) return 'ลบ' + numberToThaiWords(-num);

  // If decimal exists (e.g. 15.5)
  if (!Number.isInteger(num)) {
    const rounded = Math.round(num * 10) / 10;
    const parts = rounded.toString().split('.');
    const intWords = numberToThaiWords(parseInt(parts[0], 10));
    if (parts.length > 1) {
      const decMap: Record<string, string> = {
        '0': 'ศูนย์', '1': 'หนึ่ง', '2': 'สอง', '3': 'สาม', '4': 'สี่',
        '5': 'ห้า', '6': 'หก', '7': 'เจ็ด', '8': 'แปด', '9': 'เก้า'
      };
      const decWords = parts[1].split('').map(d => decMap[d] || d).join('');
      return `${intWords}จุด${decWords}`;
    }
    return intWords;
  }

  const units = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  // Single digit fast path
  if (num === 1) return 'หนึ่ง';
  if (num === 2) return 'สอง';
  if (num === 3) return 'สาม';
  if (num === 4) return 'สี่';
  if (num === 5) return 'ห้า';
  if (num === 6) return 'หก';
  if (num === 7) return 'เจ็ด';
  if (num === 8) return 'แปด';
  if (num === 9) return 'เก้า';
  if (num === 10) return 'สิบ';

  const numStr = Math.floor(num).toString();
  const len = numStr.length;
  let result = '';

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i], 10);
    const pos = len - i - 1;

    if (digit === 0) continue;

    if (pos === 0) {
      if (digit === 1 && len > 1) {
        result += 'เอ็ด';
      } else {
        result += units[digit];
      }
    } else if (pos === 1) {
      if (digit === 1) {
        result += 'สิบ';
      } else if (digit === 2) {
        result += 'ยี่สิบ';
      } else {
        result += units[digit] + 'สิบ';
      }
    } else {
      result += units[digit] + places[pos % 6];
    }
  }

  return result;
}

// Web Audio API & Speech Synthesis Manager
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Load mute preference
    const saved = localStorage.getItem('snooker_sound_muted');
    if (saved !== null) {
      this.muted = JSON.parse(saved);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
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
    if (this.muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return this.muted;
  }

  // Voice speech synthesis
  public speak(text: string): void {
    if (this.muted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(v => {
        const l = v.lang.replace('_', '-').toLowerCase();
        return l === 'th-th' || l.startsWith('th');
      });
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio/TTS context might be restricted before user interaction
    }
  }

  public speakNumber(num: number): void {
    const thaiWords = numberToThaiWords(num);
    if (thaiWords) {
      this.speak(thaiWords);
    }
  }

  public speakScore(score: number): void {
    this.speakNumber(score);
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

