import { useEffect, useRef, useState } from "react";
import { Crosshair, Keyboard, Pause, Play, Pointer, RotateCcw, Shield, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import playerUrl from "@/assets/sprites/player.png";
import dartUrl from "@/assets/sprites/dart.png";
import cruiserUrl from "@/assets/sprites/cruiser.png";
import orbUrl from "@/assets/sprites/orb.png";
import multiUrl from "@/assets/sprites/multi.png";
import shieldUrl from "@/assets/sprites/shield.png";
import speedUrl from "@/assets/sprites/speed.png";
import { createAudio, type AudioBus, type SfxName } from "@/game/audio";
import { render, type Sprites } from "@/game/render";
import { loadMute, loadScores, saveMute, submitScore, type ScoreRow } from "@/game/scores";
import {
  createGame,
  drainSfx,
  goMenu,
  pointFromUser,
  resizeGame,
  setQaKeys,
  setQaPointer,
  startRun,
  step,
  togglePause,
  type Game,
} from "@/game/sim";

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX: () => number;
      getY: () => number;
      setKeys: (codes: string[]) => void;
      setPointer: (x: number, y: number, active: boolean) => void;
      getMode: () => string;
      getHp: () => number;
      getScore: () => number;
      getWave: () => number;
      enemyCount: () => number;
      bulletCount: () => number;
    };
  }
}

const STEP = 1 / 60;

function loadSprite(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

function formatScore(n: number) {
  return Math.round(n).toLocaleString("zh-CN");
}

function Board({ rows }: { rows: ScoreRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">还没有纪录。打完一局就会留在这台设备上。</p>;
  }
  return (
    <ol className="flex flex-col gap-1.5">
      {rows.map((row, index) => (
        <li key={`${row.at}-${index}`} className="flex items-baseline gap-3 text-sm">
          <span className="w-5 font-display text-primary">{index + 1}</span>
          <span className="tabular flex-1 font-display text-base text-fg">{formatScore(row.score)}</span>
          <span className="text-muted">第 {row.wave} 波</span>
          <span className="text-muted">
            {new Date(row.at).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const audioRef = useRef<AudioBus | null>(null);
  const spritesRef = useRef<Sprites>({
    player: null,
    dart: null,
    orb: null,
    cruiser: null,
    elite: null,
    multi: null,
    shield: null,
    speed: null,
  });
  const modeRef = useRef<Game["mode"]>("menu");
  const [mode, setMode] = useState<Game["mode"]>("menu");
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(1);
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState(0);

  const scoreRef = useRef<HTMLParagraphElement>(null);
  const waveRef = useRef<HTMLParagraphElement>(null);
  const comboRef = useRef<HTMLParagraphElement>(null);
  const bestRef = useRef<HTMLParagraphElement>(null);
  const hpTextRef = useRef<HTMLSpanElement>(null);
  const hpFillRef = useRef<HTMLDivElement>(null);
  const multiRef = useRef<HTMLSpanElement>(null);
  const shieldRef = useRef<HTMLSpanElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const saved = loadScores();
    setRows(saved);
    setBest(saved[0]?.score ?? 0);
    setMuted(loadMute());
  }, []);

  useEffect(() => {
    let dead = false;
    const pairs: [keyof Sprites, string][] = [
      ["player", playerUrl],
      ["dart", dartUrl],
      ["orb", orbUrl],
      ["cruiser", cruiserUrl],
      ["multi", multiUrl],
      ["shield", shieldUrl],
      ["speed", speedUrl],
    ];
    void Promise.all(pairs.map(async ([key, url]) => [key, await loadSprite(url)] as const)).then((loaded) => {
      if (dead) return;
      const next = { ...spritesRef.current };
      for (const [key, img] of loaded) next[key] = img;
      next.elite = next.cruiser;
      spritesRef.current = next;
    });
    return () => {
      dead = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const g = createGame();
    gameRef.current = g;
    const audio = createAudio();
    audioRef.current = audio;
    audio.setMuted(loadMute());

    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      resizeGame(g, rect.width, rect.height);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);

    const localPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = localPoint(event);
      const active = event.pointerType === "mouse" ? true : (event.buttons & 1) === 1;
      pointFromUser(g, point.x, point.y, active);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") canvas.setPointerCapture(event.pointerId);
      const point = localPoint(event);
      pointFromUser(g, point.x, point.y, true);
    };
    const onPointerUp = (event: PointerEvent) => {
      const point = localPoint(event);
      pointFromUser(g, point.x, point.y, event.pointerType === "mouse");
    };
    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") pointFromUser(g, g.pointer.x, g.pointer.y, false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code.startsWith("Arrow")) event.preventDefault();
      audio.unlock();
      g.keys.add(event.code);
      if (event.repeat) return;
      if (event.code === "Escape" || event.code === "KeyP") {
        if (g.mode === "play" || g.mode === "pause") togglePause(g);
      }
      if (event.code === "Enter" && g.mode === "menu") {
        audio.unlock();
        startRun(g);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      g.keys.delete(event.code);
    };
    const clearKeys = () => g.keys.clear();

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
    const onVis = () => {
      if (document.hidden && g.mode === "play") g.mode = "pause";
      audio.resume();
    };
    document.addEventListener("visibilitychange", onVis);

    window.__controlsTest = {
      getYaw: () => g.player.aim,
      getSpeed: () => Math.hypot(g.player.vx, g.player.vy),
      getX: () => g.player.x,
      getY: () => g.player.y,
      setKeys: (codes: string[]) => setQaKeys(g, codes),
      setPointer: (x: number, y: number, active: boolean) => setQaPointer(g, x, y, active),
      getMode: () => g.mode,
      getHp: () => g.player.hp,
      getScore: () => g.score,
      getWave: () => g.wave,
      enemyCount: () => g.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0),
      bulletCount: () => g.bullets.reduce((n, b) => n + (b.alive && b.friendly ? 1 : 0), 0),
    };

    let last = performance.now();
    let acc = 0;
    let raf = 0;
    const overLatch = { current: false };

    const paintHud = () => {
      if (scoreRef.current) scoreRef.current.textContent = formatScore(g.score);
      if (waveRef.current) waveRef.current.textContent = `第 ${g.wave} 波`;
      if (comboRef.current) {
        comboRef.current.textContent = g.combo >= 2 ? `${g.combo} 连击` : "";
      }
      if (bestRef.current) bestRef.current.textContent = formatScore(Math.max(bestRefLive(), g.score));
      const pct = Math.max(0, Math.min(100, (g.player.hp / g.player.maxHp) * 100));
      if (hpFillRef.current) {
        hpFillRef.current.style.width = `${pct}%`;
        hpFillRef.current.style.background = g.player.shieldT > 0 ? "var(--color-ice)" : "var(--color-danger)";
      }
      if (hpTextRef.current) hpTextRef.current.textContent = `${Math.ceil(g.player.hp)}`;
      const chip = (el: HTMLSpanElement | null, seconds: number, label: string) => {
        if (!el) return;
        if (seconds <= 0) {
          el.style.display = "none";
          return;
        }
        el.style.display = "inline-flex";
        el.dataset.seconds = seconds.toFixed(0);
        const text = el.querySelector("[data-label]");
        if (text) text.textContent = `${label} ${Math.ceil(seconds)}s`;
      };
      chip(multiRef.current, g.player.multiT, g.player.multiLevel >= 2 ? "五重" : "三重");
      chip(shieldRef.current, g.player.shieldT, "护盾");
      chip(speedRef.current, g.player.speedT, "加速");
    };

    const bestRefLive = () => {
      const node = bestRef.current;
      const fromDom = node ? Number(node.dataset.best ?? "0") : 0;
      return Number.isFinite(fromDom) ? fromDom : 0;
    };

    const frame = (now: number) => {
      const raw = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (g.mode === "play") {
        acc += raw;
        let steps = 0;
        while (acc >= STEP && steps < 5) {
          step(g, STEP);
          acc -= STEP;
          steps += 1;
        }
        if (steps === 5) acc = 0;
      } else {
        acc = 0;
        step(g, raw);
      }
      const names: SfxName[] = drainSfx(g);
      for (const name of names) audio.play(name);
      const dpr = canvas.width / Math.max(1, wrap.getBoundingClientRect().width);
      render(ctx, g, spritesRef.current, dpr);
      paintHud();
      if (g.mode !== modeRef.current) {
        const prev = modeRef.current;
        modeRef.current = g.mode;
        if (g.mode === "over" && prev !== "over" && !overLatch.current) {
          overLatch.current = true;
          const result = submitScore(g.score, g.wave);
          setRows(result.rows);
          setRank(result.rank);
          setFinalScore(g.score);
          setFinalWave(g.wave);
          const top = result.rows[0]?.score ?? g.score;
          setBest(top);
          if (bestRef.current) bestRef.current.dataset.best = String(top);
        }
        if (g.mode !== "over") overLatch.current = false;
        setMode(g.mode);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", onVis);
      delete window.__controlsTest;
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (bestRef.current) bestRef.current.dataset.best = String(best);
  }, [best]);

  const unlockAnd = (fn: () => void) => {
    audioRef.current?.unlock();
    fn();
  };

  const onStart = () => {
    const g = gameRef.current;
    if (!g) return;
    unlockAnd(() => startRun(g));
  };

  const onPause = () => {
    const g = gameRef.current;
    if (!g) return;
    togglePause(g);
  };

  const onToggleMute = () => {
    const next = !muted;
    setMuted(next);
    saveMute(next);
    audioRef.current?.unlock();
    audioRef.current?.setMuted(next);
  };

  const showHud = mode === "play" || mode === "pause";

  return (
    <main
      ref={wrapRef}
      className="game-root relative h-dvh w-full select-none overflow-hidden bg-bg text-fg"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="赤曜战斗画面" />

      {showHud ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
          <header className="hud-safe-top flex items-start justify-between gap-3 px-4">
            <div>
              <p className="font-display text-xs tracking-widest text-primary">CHIYAO</p>
              <p ref={waveRef} className="text-lg font-semibold">
                第 1 波
              </p>
            </div>
            <div className="text-center">
              <p ref={scoreRef} className="tabular font-display text-3xl leading-none sm:text-4xl">
                0
              </p>
              <p ref={comboRef} className="mt-1 h-5 text-sm text-primary" />
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-xs text-muted">最高</p>
                <p ref={bestRef} data-best={best} className="tabular font-display text-sm">
                  {formatScore(best)}
                </p>
              </div>
              <button
                type="button"
                aria-label={mode === "pause" ? "继续" : "暂停"}
                onClick={onPause}
                className="grid size-11 place-items-center rounded-full border border-border bg-bg-raised/85 text-fg"
              >
                {mode === "pause" ? <Play className="size-5" /> : <Pause className="size-5" />}
              </button>
            </div>
          </header>
          <div className="flex-1" />
          <footer className="hud-safe-bottom px-4">
            <div className="flex items-end justify-between gap-3">
              <div className="w-52 max-w-[58%]">
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                  <span>生命</span>
                  <span ref={hpTextRef} className="tabular text-fg">
                    100
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <div ref={hpFillRef} className="h-full w-full bg-danger" />
                </div>
                <p className="mt-2 hidden text-xs text-muted md:block">WASD 或指针移动 · 自动瞄准射击 · Esc 暂停</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <span
                  ref={multiRef}
                  style={{ display: "none" }}
                  className="items-center gap-1 rounded-full border border-border bg-bg-raised/80 px-2.5 py-1 text-xs text-primary"
                >
                  <Crosshair className="size-3.5" aria-hidden />
                  <span data-label>三重</span>
                </span>
                <span
                  ref={shieldRef}
                  style={{ display: "none" }}
                  className="items-center gap-1 rounded-full border border-border bg-bg-raised/80 px-2.5 py-1 text-xs text-ice"
                >
                  <Shield className="size-3.5" aria-hidden />
                  <span data-label>护盾</span>
                </span>
                <span
                  ref={speedRef}
                  style={{ display: "none" }}
                  className="items-center gap-1 rounded-full border border-border bg-bg-raised/80 px-2.5 py-1 text-xs text-primary"
                >
                  <Zap className="size-3.5" aria-hidden />
                  <span data-label>加速</span>
                </span>
              </div>
            </div>
          </footer>
        </div>
      ) : null}

      {mode === "menu" ? (
        <div className="absolute inset-0 z-20 overflow-y-auto px-4 py-8">
          <div className="overlay-in menu-safe-top mx-auto flex w-full max-w-md flex-col gap-6 pb-10">
            <header>
              <p className="font-display text-xs tracking-widest text-primary">CHIYAO</p>
              <h1 className="mt-2 text-5xl font-semibold tracking-wide">赤曜</h1>
              <p className="mt-2 text-base text-muted">俯视深空。撑过一波又一波，把火力、护盾和速度抢到手。</p>
            </header>
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-ink"
            >
              <Play className="size-5" aria-hidden />
              开始出击
            </button>
            <section className="grid gap-3 rounded-lg border border-border bg-bg-raised/85 p-4">
              <h2 className="text-sm font-semibold text-fg">操作</h2>
              <p className="flex items-start gap-3 text-sm text-muted">
                <Keyboard className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                WASD 或方向键移动。斜向不会更快。键盘优先于指针。
              </p>
              <p className="flex items-start gap-3 text-sm text-muted">
                <Pointer className="mt-0.5 size-4 shrink-0 text-ice" aria-hidden />
                桌面把光标放进战场，飞船会平滑跟上。触屏按住拖动。
              </p>
              <p className="flex items-start gap-3 text-sm text-muted">
                <Crosshair className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                自动朝最近的敌人射击。拾取三重／五重射击、护盾和加速。
              </p>
            </section>
            <section className="rounded-lg border border-border bg-bg-raised/85 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Trophy className="size-4 text-primary" aria-hidden />
                最高分榜
              </h2>
              <Board rows={rows} />
            </section>
            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface px-4 text-sm"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              {muted ? "音效已关" : "音效开着"}
            </button>
          </div>
        </div>
      ) : null}

      {mode === "pause" ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-bg/70 px-4">
          <div className="overlay-in w-full max-w-sm rounded-lg border border-border bg-bg-raised p-6">
            <p className="font-display text-xs tracking-widest text-primary">PAUSED</p>
            <h2 className="mt-2 text-3xl font-semibold">暂停</h2>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onPause}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-ink"
              >
                <Play className="size-5" />
                继续
              </button>
              <button
                type="button"
                onClick={() => {
                  const g = gameRef.current;
                  if (g) unlockAnd(() => startRun(g));
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface font-medium"
              >
                <RotateCcw className="size-5" />
                重新开始
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface font-medium"
              >
                {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                {muted ? "打开音效" : "关闭音效"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const g = gameRef.current;
                  if (g) goMenu(g);
                }}
                className="inline-flex h-12 items-center justify-center rounded-lg text-sm text-muted"
              >
                返回标题
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "over" ? (
        <div className="absolute inset-0 z-20 overflow-y-auto bg-bg/75 px-4 py-8">
          <div className="overlay-in mx-auto flex w-full max-w-md flex-col gap-5 pb-10">
            <header>
              <p className="font-display text-xs tracking-widest text-danger">SIGNAL LOST</p>
              <h2 className="mt-2 text-4xl font-semibold">舰体损毁</h2>
              <p className="mt-2 text-muted">抵达第 {finalWave} 波</p>
            </header>
            <p className="tabular font-display text-5xl text-primary">{formatScore(finalScore)}</p>
            <p className="text-sm text-muted">
              {rank ? `写入最高分榜第 ${rank} 名` : "这次没挤进前八，再冲一次。"}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-ink"
              >
                <RotateCcw className="size-5" />
                再来一局
              </button>
              <button
                type="button"
                onClick={() => {
                  const g = gameRef.current;
                  if (g) goMenu(g);
                }}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-lg border border-border bg-surface font-medium"
              >
                返回标题
              </button>
            </div>
            <section className="rounded-lg border border-border bg-bg-raised/90 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Trophy className="size-4 text-primary" aria-hidden />
                最高分榜
              </h3>
              <Board rows={rows} />
            </section>
          </div>
        </div>
      ) : null}
    </main>
  );
}
