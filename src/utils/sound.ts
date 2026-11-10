// Web Audio API Synthesizer for notifications, success checkout, and coin reward chimes

class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft notification ping
  playNotification() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Audio might be blocked by browser policy until user interaction
    }
  }

  // Celebratory chord for order placement
  playOrderSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = this.ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // Audio catch
    }
  }

  // Coin rattle for loyalty points
  playPointsEarned() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [987.77, 1318.51, 1567.98]; // B5, E6, G6
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const t = this.ctx.currentTime + idx * 0.06;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {
      // Audio catch
    }
  }

  // Cash register / order ping for seller
  playSellerOrderAlert() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(740, this.ctx.currentTime);
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // Audio catch
    }
  }
}

export const sound = new SoundService();
