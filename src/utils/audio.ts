import { resolveLocalAudioUrl } from '../data/audioManifest';
import { AudioLang, normalizeAudioText } from './audioNormalizer';

type ExtendedAudioElement = HTMLAudioElement & {
  preservesPitch?: boolean;
  mozPreservesPitch?: boolean;
  webkitPreservesPitch?: boolean;
};

// Minimal valid 1-sample silent WAV used solely to unlock <audio> on iOS Safari / Android WebView
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

/**
 * Production-ready offline AudioManager for Lumi Kids.
 * - Plays pre-generated local MP3 files from /public/audio/ via Web/PWA/TWA <audio>.
 * - Zero dependency on browser Web Speech API.
 * - Preserves low-latency Web Audio API chimes & feedback SFX.
 * - Works offline (precached by Service Worker) across Android, iOS, Chrome, WebView, and TWA.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private speechAudio: ExtendedAudioElement | null = null;
  private activeCleanup: (() => void) | null = null;
  private speakSeq = 0;
  private unlocked = false;
  private isPlayingSpeech = false;

  constructor() {
    this.initAudio();
  }

  private initAudio() {
    if (typeof window === 'undefined' || this.unlocked) return;

    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      try {
        const ctx = this.getContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const el = this.getSpeechAudioElement();
        if (el) {
          el.setAttribute('playsinline', '');
          el.setAttribute('webkit-playsinline', '');
          // Prime idle <audio> during first user gesture so async iOS/WebView playback is never blocked
          if (!this.isPlayingSpeech && !el.src) {
            el.muted = true;
            el.src = SILENT_WAV_DATA_URI;
            const p = el.play();
            if (p && typeof p.then === 'function') {
              p.then(() => {
                if (!this.isPlayingSpeech && el.src === SILENT_WAV_DATA_URI) {
                  el.pause();
                }
                el.muted = false;
              }).catch(() => {
                el.muted = false;
              });
            } else {
              el.muted = false;
            }
          }
        }
      } catch {
        // Ignore gesture unlock edge errors
      }
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
  }

  private getSpeechAudioElement(): ExtendedAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      return null;
    }
    if (!this.speechAudio) {
      const audio = new Audio() as ExtendedAudioElement;
      audio.preload = 'auto';
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      this.enablePitchPreservation(audio);
      this.speechAudio = audio;
    }
    return this.speechAudio;
  }

  private enablePitchPreservation(audio: ExtendedAudioElement) {
    try {
      audio.preservesPitch = true;
      audio.mozPreservesPitch = true;
      audio.webkitPreservesPitch = true;
    } catch {
      // Some older WebViews ignore pitch preservation assignment
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private resolveUrl(text: string, lang: AudioLang): string | null {
    const clean = normalizeAudioText(text);
    if (!clean) return null;

    const direct = resolveLocalAudioUrl(clean, lang);
    if (direct) return direct;

    // Cross-language fallback if an Arabic message is triggered while UI language is 'en'
    const hasArabicChars = /[\u0600-\u06FF]/.test(clean);
    if (lang === 'en' && hasArabicChars) {
      return resolveLocalAudioUrl(clean, 'ar');
    }
    if (lang === 'ar' && !hasArabicChars) {
      return resolveLocalAudioUrl(clean, 'en');
    }
    return null;
  }

  // Play a cheerful chime when child succeeds
  playSuccessChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } catch {
      // Ignore audio context errors if blocked by browser policy
    }
  }

  // Soft, warm encouragement tone (never harsh, safe for sensitive children)
  playEncouragementChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [392.0, 440.0, 523.25]; // G4, A4, C5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    } catch {}
  }

  // Playful pop bubble on clicking interactive elements
  playPop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  // Playful laughter / sparkle chirp when the star mascot is clicked
  playStarSparkle() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const freqs = [659.25, 880, 1174.66, 1318.51, 1567.98];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.28);
      });
    } catch {}
  }

  // Counting item sound (rises with number)
  playCountTone(countIndex: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const baseFreq = 300 + Math.min(countIndex, 12) * 50;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  /**
   * Stops any currently playing local audio clip or sequence immediately.
   */
  public stopSpeech() {
    this.speakSeq += 1;
    this.isPlayingSpeech = false;
    if (this.activeCleanup) {
      const cleanup = this.activeCleanup;
      this.activeCleanup = null;
      cleanup();
    }
    if (this.speechAudio) {
      try {
        this.speechAudio.pause();
        if (this.speechAudio.readyState > 0) {
          this.speechAudio.currentTime = 0;
        }
      } catch {
        // Ignore reset errors on uninitialized media elements
      }
    }
  }

  private playUrlSingle(
    url: string,
    safeRate: number,
    seq: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (seq !== this.speakSeq) {
        resolve();
        return;
      }

      const audio = this.getSpeechAudioElement();
      if (!audio) {
        resolve();
        return;
      }

      let finished = false;
      const safetyTimer = window.setTimeout(() => {
        if (finished) return;
        done();
      }, 25000);

      const applyRate = () => {
        try {
          this.enablePitchPreservation(audio);
          audio.defaultPlaybackRate = safeRate;
          audio.playbackRate = safeRate;
        } catch {
          // Ignore unsupported playbackRate edge cases
        }
      };

      const done = () => {
        if (finished) return;
        finished = true;
        if (seq === this.speakSeq) {
          this.isPlayingSpeech = false;
        }
        window.clearTimeout(safetyTimer);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadedmetadata', applyRate);
        if (this.activeCleanup === cleanup) {
          this.activeCleanup = null;
        }
        resolve();
      };

      const cleanup = () => {
        done();
      };

      const handleEnded = () => done();
      const handleError = () => {
        // Ignore errors caused by interrupting previous playback with a newer clip
        if (seq === this.speakSeq) {
          console.warn('[AudioManager] Local audio failed to load:', url);
        }
        done();
      };

      this.activeCleanup = cleanup;
      this.isPlayingSpeech = true;
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadedmetadata', applyRate);

      try {
        audio.muted = false;
        audio.volume = 1;
        audio.pause();
        const sameSource = audio.getAttribute('data-audio-url') === url && audio.readyState >= 2;
        if (sameSource) {
          audio.currentTime = 0;
        } else {
          audio.setAttribute('data-audio-url', url);
          audio.src = url;
        }
        applyRate();
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err) => {
            if (seq === this.speakSeq && err?.name !== 'AbortError') {
              console.warn('[AudioManager] Audio playback skipped:', err?.message || err);
            }
            done();
          });
        }
      } catch (err) {
        if (seq === this.speakSeq) {
          console.warn('[AudioManager] Synchronous audio error:', err);
        }
        done();
      }
    });
  }

  /**
   * Plays pre-generated local MP3 audio matching `text` and `lang`.
   * Falls back gracefully without throwing if the MP3 is missing or playback is blocked.
   */
  speak(text: string, lang: AudioLang = 'ar', rate: number = 0.75, onEnd?: () => void) {
    this.stopSpeech();
    const seq = this.speakSeq;

    if (typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    const url = this.resolveUrl(text, lang);
    if (!url) {
      console.warn('[AudioManager] No local audio mapping for:', { text, lang });
      onEnd?.();
      return;
    }

    // Speech rate tuned relative to child-friendly base pace (0.8 -> 1.0x natural MP3 speed)
    const safeRate = Math.min(1.5, Math.max(0.65, rate / 0.8));

    void this.playUrlSingle(url, safeRate, seq).then(() => {
      if (seq === this.speakSeq) {
        onEnd?.();
      }
    });
  }

  /**
   * Plays a sequence of pre-generated local MP3 clips back-to-back.
   * Gracefully skips any unmapped segments (e.g., custom typed nicknames).
   */
  speakSequential(
    texts: string[],
    lang: AudioLang = 'ar',
    rate: number = 0.75,
    onEnd?: () => void
  ) {
    this.stopSpeech();
    const seq = this.speakSeq;

    if (typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    const urls = texts
      .map((t) => this.resolveUrl(t, lang))
      .filter((u): u is string => Boolean(u));

    if (urls.length === 0) {
      console.warn('[AudioManager] No local audio mappings for sequence:', { texts, lang });
      onEnd?.();
      return;
    }

    const safeRate = Math.min(1.5, Math.max(0.65, rate / 0.8));

    (async () => {
      for (const url of urls) {
        if (seq !== this.speakSeq) return;
        await this.playUrlSingle(url, safeRate, seq);
      }
      if (seq === this.speakSeq) {
        onEnd?.();
      }
    })();
  }

  // Pronounce Arabic text (backwards compatible alias)
  speakArabic(text: string, rate: number = 0.75, onEnd?: () => void) {
    this.speak(text, 'ar', rate, onEnd);
  }

  // Pronounce English text clearly for children
  speakEnglish(text: string, rate: number = 0.8, onEnd?: () => void) {
    this.speak(text, 'en', rate, onEnd);
  }
}

export const audioManager = new AudioManager();
export const soundManager = audioManager;
