// Web Audio API Synthesizer for magical sound effects (zero external asset dependency)
class MagicAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft magical chime for buttons and transitions
  playChime(type = 'sparkle') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = type === 'sparkle' ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25, 880];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  playRocketLaunch(delay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(115, now);
    oscillator.frequency.exponentialRampToValueAtTime(640, now + 0.32);
    oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.82);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.84);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.86);
  }

  // Wax seal breaking sound (crackle + soft pop)
  playSealBreak() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);

    // Follow with a small sparkle
    setTimeout(() => this.playChime('sparkle'), 120);
  }

  // Blowing candles out (soft wind puff + magical chime)
  playCandleBlow() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Low frequency puff
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.35);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);

    // Celebration glockenspiel
    const celebrationNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    celebrationNotes.forEach((freq, idx) => {
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'triangle';
      cOsc.frequency.setValueAtTime(freq, now + 0.25 + idx * 0.09);

      cGain.gain.setValueAtTime(0, now + 0.25 + idx * 0.09);
      cGain.gain.linearRampToValueAtTime(0.14, now + 0.25 + idx * 0.09 + 0.02);
      cGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25 + idx * 0.09 + 0.8);

      cOsc.connect(cGain);
      cGain.connect(this.ctx.destination);

      cOsc.start(now + 0.25 + idx * 0.09);
      cOsc.stop(now + 0.25 + idx * 0.09 + 0.85);
    });
  }

  // Fanfare for the Room of Requirement & Certificate
  playFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { freq: [392, 493.88, 587.33], time: 0 },
      { freq: [440, 554.37, 659.25], time: 0.22 },
      { freq: [523.25, 659.25, 783.99, 1046.5], time: 0.48 }
    ];

    chords.forEach(({ freq, time }) => {
      freq.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.08, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.95);
      });
    });
  }

  playFireworks() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const noise = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noise.length; i += 1) {
      noise[i] = (Math.random() * 2 - 1) * (1 - i / noise.length);
    }

    Array.from({ length: 5 }, (_, index) => {
      const start = now + index * 0.28;
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(110, start);
      boom.frequency.exponentialRampToValueAtTime(38, start + 0.32);
      boomGain.gain.setValueAtTime(0.0001, start);
      boomGain.gain.linearRampToValueAtTime(0.18, start + 0.025);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.36);
      boom.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boom.start(start);
      boom.stop(start + 0.38);

      const crackle = this.ctx.createBufferSource();
      const crackleGain = this.ctx.createGain();
      crackle.buffer = noiseBuffer;
      crackleGain.gain.setValueAtTime(0.0001, start);
      crackleGain.gain.linearRampToValueAtTime(0.1, start + 0.02);
      crackleGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      crackle.connect(crackleGain);
      crackleGain.connect(this.ctx.destination);
      crackle.start(start);
      crackle.stop(start + 0.3);

      const sparkle = this.ctx.createOscillator();
      const sparkleGain = this.ctx.createGain();
      sparkle.type = 'triangle';
      sparkle.frequency.setValueAtTime([783.99, 987.77, 1174.66, 1318.51, 1567.98][index], start + 0.06);
      sparkleGain.gain.setValueAtTime(0.0001, start + 0.06);
      sparkleGain.gain.linearRampToValueAtTime(0.07, start + 0.09);
      sparkleGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
      sparkle.connect(sparkleGain);
      sparkleGain.connect(this.ctx.destination);
      sparkle.start(start + 0.06);
      sparkle.stop(start + 0.68);
    });
  }

  // Gentle paper rustle / flap
  playPaperFlap() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const magicAudio = new MagicAudio();
