// Web Audio API synthesizer for interactive Trending Audio sample previews

class AudioPreviewEngine {
  private ctx: AudioContext | null = null;
  private timerId: number | null = null;
  private progressTimerId: number | null = null;
  private currentTrackId: string | null = null;

  public stop() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.progressTimerId !== null) {
      window.clearInterval(this.progressTimerId);
      this.progressTimerId = null;
    }
    this.currentTrackId = null;
  }

  public playLoop(
    trackId: string,
    notes: number[],
    bpm: number,
    waveform: "sine" | "triangle" | "sawtooth",
    onProgress: (pct: number) => void,
    onEnded: () => void
  ) {
    this.stop();

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      onEnded();
      return;
    }

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    this.currentTrackId = trackId;
    const stepMs = Math.max(140, Math.round((60 / bpm) * 500));
    let step = 0;
    const totalSteps = 16;

    const triggerNote = () => {
      if (!this.ctx || this.currentTrackId !== trackId) return;
      const freq = notes[step % notes.length];
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = waveform;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + stepMs / 1000);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + stepMs / 1000 + 0.02);
      }

      step += 1;
      onProgress(Math.min(100, Math.round((step / totalSteps) * 100)));

      if (step >= totalSteps) {
        this.stop();
        onEnded();
      }
    };

    triggerNote();
    this.timerId = window.setInterval(triggerNote, stepMs);
  }
}

export const audioPreviewEngine = new AudioPreviewEngine();
