/**
 * A clock that stands in for the camera video where a sample has none in public
 * (the `poster` and `lane` tiers), so the 3D view, the readout and the lane still
 * play, on one clock, from the 3D joints alone.
 *
 * It carries the slice of `HTMLVideoElement` those views use: `currentTime`
 * (settable: a seek fires `seeking`, `seeked`, `timeupdate`), `paused`, `ended`,
 * `readyState`, `duration`, `play()`, `pause()` and the events. It has no
 * `requestVideoFrameCallback`, so the views fall back to their rAF loops while it
 * runs. It loops at the end, as the preview videos do.
 */
export class VirtualClock extends EventTarget {
  readonly duration: number;
  readonly readyState = 4;
  readonly ended = false;
  private at = 0;
  private since: number | null = null;

  constructor(duration: number) {
    super();
    this.duration = Math.max(0.001, duration);
  }

  get paused() {
    return this.since == null;
  }

  get currentTime() {
    if (this.since == null) return this.at;
    return (this.at + (performance.now() - this.since) / 1000) % this.duration;
  }

  set currentTime(t: number) {
    this.at = Math.min(Math.max(0, t), this.duration - 0.001);
    if (this.since != null) this.since = performance.now();
    for (const e of ["seeking", "seeked", "timeupdate"]) this.dispatchEvent(new Event(e));
  }

  play(): Promise<void> {
    if (this.since == null) {
      this.since = performance.now();
      this.dispatchEvent(new Event("play"));
    }
    return Promise.resolve();
  }

  pause() {
    if (this.since == null) return;
    this.at = this.currentTime;
    this.since = null;
    this.dispatchEvent(new Event("pause"));
  }

  /** Typed as the element the views take; they use only what is above. */
  asVideo(): HTMLVideoElement {
    return this as unknown as HTMLVideoElement;
  }
}
