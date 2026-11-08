export type SfxName =
  | "shot"
  | "eshot"
  | "hit"
  | "explode"
  | "hurt"
  | "pickup"
  | "block"
  | "wave"
  | "over";

export type AudioBus = {
  unlock: () => void;
  resume: () => void;
  setMuted: (muted: boolean) => void;
  play: (name: SfxName) => void;
};

export function createAudio(): AudioBus {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let sfx: GainNode | null = null;
  let muted = false;
  let voices = 0;

  function ensure() {
    if (ctx) return ctx;
    const context = new AudioContext({ latencyHint: "interactive" });
    const masterGain = context.createGain();
    const sfxGain = context.createGain();
    masterGain.gain.value = 0.9;
    sfxGain.gain.value = 1;
    sfxGain.connect(masterGain);
    masterGain.connect(context.destination);
    ctx = context;
    master = masterGain;
    sfx = sfxGain;
    return context;
  }

  function unlock() {
    const context = ensure();
    if (context.state === "suspended") void context.resume();
  }

  function resume() {
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  function setMuted(next: boolean) {
    muted = next;
    if (!master || !ctx) return;
    master.gain.setTargetAtTime(next ? 0 : 0.9, ctx.currentTime, 0.02);
  }

  function env(duration: number, peak: number) {
    const context = ctx!;
    const gain = context.createGain();
    gain.connect(sfx!);
    const t = context.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.03, duration));
    return gain;
  }

  function tone(freq: number, dur: number, type: OscillatorType, peak: number, slide = 0) {
    if (!ctx || muted || voices > 16) return;
    const osc = ctx.createOscillator();
    const gain = env(dur, peak);
    osc.type = type;
    const start = Math.max(40, freq);
    osc.frequency.setValueAtTime(start, ctx.currentTime);
    if (slide !== 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, start + slide), ctx.currentTime + dur);
    }
    osc.connect(gain);
    voices += 1;
    osc.onended = () => {
      voices = Math.max(0, voices - 1);
      osc.disconnect();
      gain.disconnect();
    };
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  function noise(dur: number, peak: number, highpass: number) {
    if (!ctx || muted || voices > 16) return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpass;
    const gain = env(dur, peak);
    source.connect(filter);
    filter.connect(gain);
    voices += 1;
    source.onended = () => {
      voices = Math.max(0, voices - 1);
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start();
  }

  function play(name: SfxName) {
    if (!ctx) return;
    const vary = 0.94 + Math.random() * 0.12;
    switch (name) {
      case "shot":
        tone(720 * vary, 0.055, "square", 0.03, -340);
        break;
      case "eshot":
        tone(210 * vary, 0.07, "sawtooth", 0.028, -70);
        break;
      case "hit":
        noise(0.05, 0.045, 900);
        break;
      case "explode":
        noise(0.24, 0.1, 180);
        tone(130, 0.22, "sine", 0.07, -80);
        break;
      case "hurt":
        tone(380, 0.16, "sawtooth", 0.055, -240);
        break;
      case "pickup":
        tone(523, 0.07, "square", 0.045);
        tone(784, 0.12, "square", 0.04);
        break;
      case "block":
        tone(860, 0.09, "sine", 0.05, 220);
        break;
      case "wave":
        tone(494, 0.1, "sine", 0.05);
        tone(740, 0.16, "sine", 0.045);
        break;
      case "over":
        tone(280, 0.32, "sawtooth", 0.06, -160);
        noise(0.28, 0.07, 240);
        break;
      default:
        break;
    }
  }

  return { unlock, resume, setMuted, play };
}
