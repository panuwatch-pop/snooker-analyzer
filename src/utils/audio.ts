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

// Web Audio API & Real Sweet Female Thai Voice Manager
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Load mute preference
    const saved = localStorage.getItem('snooker_sound_muted');
    if (saved !== null) {
      this.muted = JSON.parse(saved);
    }

    if (typeof window !== 'undefined') {
      this.initVoices();
      this.preloadCommonAudios();
    }
  }

  // Preload single-digit balls (1-7), fouls, and common phrases for instant 0ms latency
  private preloadCommonAudios(): void {
    if (typeof window === 'undefined') return;
    try {
      const commonFiles = [
        'num_0.mp3', 'num_1.mp3', 'num_2.mp3', 'num_3.mp3', 'num_4.mp3', 'num_5.mp3', 'num_6.mp3', 'num_7.mp3',
        'foul_4.mp3', 'foul_5.mp3', 'foul_6.mp3', 'foul_7.mp3',
        'p1_win.mp3', 'p2_win.mp3', 'tie.mp3'
      ];
      commonFiles.forEach(file => {
        const audio = new Audio(`/sounds/${file}`);
        audio.preload = 'auto';
        this.audioCache.set(file, audio);
      });
    } catch {
      // ignore
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

    // Proactively unlock speech/audio on first user interaction
    const unlock = () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
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
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return this.muted;
  }

  // Play real sweet female voice audio clip with 0ms latency
  private playAudioFile(fileName: string, fallbackText?: string): void {
    if (this.muted) return;
    if (typeof window === 'undefined') return;

    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      let audio = this.audioCache.get(fileName);
      if (!audio) {
        audio = new Audio(`/sounds/${fileName}`);
        audio.preload = 'auto';
        this.audioCache.set(fileName, audio);
      } else {
        audio.currentTime = 0;
      }

      audio.volume = 1.0;
      this.currentAudio = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (fallbackText) {
            this.speakWithTTS(fallbackText);
          }
        });
      }
    } catch {
      if (fallbackText) {
        this.speakWithTTS(fallbackText);
      }
    }
  }

  // Fallback Web Speech Synthesis
  public speakWithTTS(text: string): void {
    if (this.muted || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.98;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      const voices = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
      const thaiVoices = voices.filter(v => {
        const l = (v.lang || '').replace('_', '-').toLowerCase();
        const n = (v.name || '').toLowerCase();
        return l.startsWith('th') || n.includes('thai') || n.includes('ไทย');
      });

      const bestVoice = thaiVoices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('natural') || n.includes('online') || n.includes('google') || n.includes('premwadee') || n.includes('niwat') || n.includes('kanya');
      }) || thaiVoices[0];

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }

  // General speech
  public speak(text: string): void {
    this.speakWithTTS(text);
  }

  // Sweet female voice for potting points (1 - 7, 0 - 147)
  public speakNumber(num: number): void {
    const rounded = Math.round(num);
    if (rounded >= 0 && rounded <= 147 && Number.isInteger(num)) {
      this.playAudioFile(`num_${rounded}.mp3`, numberToThaiWords(num));
    } else {
      this.speakWithTTS(numberToThaiWords(num));
    }
  }

  // Speak visit score
  public speakScore(score: number): void {
    this.speakNumber(score);
  }

  // Speak winner (ผู้เล่น 1 ชนะ / ผู้เล่น 2 ชนะ / แต้มเสมอกัน)
  public speakWinner(winnerName: string): void {
    if (winnerName.includes('1') || winnerName.includes('หนึ่ง')) {
      this.playAudioFile('p1_win.mp3', 'ผู้เล่นหนึ่งชนะ');
    } else if (winnerName.includes('2') || winnerName.includes('สอง')) {
      this.playAudioFile('p2_win.mp3', 'ผู้เล่นสองชนะ');
    } else if (winnerName.includes('เสมอ')) {
      this.playAudioFile('tie.mp3', 'แต้มเสมอกัน');
    } else {
      this.speakWithTTS(`${winnerName} ชนะ`);
    }
  }

  // Speak match winner
  public speakMatchWinner(winnerName: string): void {
    if (winnerName.includes('1') || winnerName.includes('หนึ่ง')) {
      this.playAudioFile('p1_match_win.mp3', 'ผู้เล่นหนึ่งชนะการแข่งขัน');
    } else if (winnerName.includes('2') || winnerName.includes('สอง')) {
      this.playAudioFile('p2_match_win.mp3', 'ผู้เล่นสองชนะการแข่งขัน');
    } else {
      this.speakWithTTS(`${winnerName} ชนะการแข่งขัน`);
    }
  }

  // Speak foul points ("ฟาวล์ สี่ แต้ม" ฯลฯ)
  public speakFoul(points: number): void {
    const pts = Math.round(points);
    if (pts >= 4 && pts <= 7) {
      this.playAudioFile(`foul_${pts}.mp3`, `ฟาวล์ ${numberToThaiWords(pts)} แต้ม`);
    } else {
      this.speakWithTTS(`ฟาวล์ ${numberToThaiWords(points)} แต้ม`);
    }
  }

  // Speak deficit ("แต้มขาดแล้ว ขาด...แต้ม")
  public speakDeficit(deficit: number): void {
    const def = Math.round(deficit);
    if (def >= 1 && def <= 60) {
      this.playAudioFile(`deficit_${def}.mp3`, `แต้มขาดแล้ว ขาด ${numberToThaiWords(def)} แต้ม`);
    } else {
      this.speakWithTTS(`แต้มขาดแล้ว ขาด ${numberToThaiWords(deficit)} แต้ม`);
    }
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


