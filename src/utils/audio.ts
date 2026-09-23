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

// Web Audio API & Native Thai Speech Synthesis Manager
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Load mute preference
    const saved = localStorage.getItem('snooker_sound_muted');
    if (saved !== null) {
      this.muted = JSON.parse(saved);
    }

    if (typeof window !== 'undefined') {
      this.initVoices();
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.voices = [];
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Proactively unlock speech synthesis on first user interaction
    const unlock = () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
      } catch {
        // ignore
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('pointerdown', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('pointerdown', unlock);
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
    if (this.muted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return this.muted;
  }

  // Voice speech synthesis for natural Thai numbers with maximum volume and clarity
  public speak(text: string): void {
    if (this.muted || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Clear any previous queued speech for instant responsiveness
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.98; // Slightly more articulated pace for high clarity in loud rooms
      utterance.pitch = 1.05; // Slightly enhanced presence/brightness for maximum cut-through
      utterance.volume = 1.0; // Maximum output level

      // Find best available Thai voice, prioritizing High-Definition Natural / Online / Google voices
      const voices = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
      const thaiVoices = voices.filter(v => {
        const l = (v.lang || '').replace('_', '-').toLowerCase();
        const n = (v.name || '').toLowerCase();
        return l.startsWith('th') || n.includes('thai') || n.includes('ไทย');
      });

      // Prefer Natural / Online / Google / Premium voices first for maximum clarity and loudness
      const bestVoice = thaiVoices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('natural') || n.includes('online') || n.includes('google') || n.includes('premwadee') || n.includes('niwat') || n.includes('kanya');
      }) || thaiVoices[0];

      if (bestVoice) {
        utterance.voice = bestVoice;
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

  public speakWinner(winnerName: string): void {
    const text = winnerName.includes('ชนะ') ? winnerName : `${winnerName} ชนะ`;
    this.speak(text);
  }

  public speakFoul(points: number): void {
    const pointsText = numberToThaiWords(points);
    this.speak(`ฟาวล์ ${pointsText} แต้ม`);
  }

  // Pot sound (kept quiet to prioritize crystal clear Thai voice)
  public playPotSound(_points: number = 1): void {
    // Triangle beep removed so that only clear Thai speech is heard
  }

  // Foul buzzer tone (subtle to not mask spoken voice)
  public playFoulSound(): void {
    // Kept quiet to prioritize crystal clear Thai voice
  }

  // Turn switch / end break subtle cue
  public playTurnSound(): void {
    // Subtle cue muted to prioritize spoken total score
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


