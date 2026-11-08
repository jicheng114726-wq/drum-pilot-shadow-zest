import type { Game, Kind, PickupType, Tint } from "@/game/sim";

export type Sprites = Record<"player" | Kind | PickupType, HTMLImageElement | null>;

const FONT =
  "Outfit, 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', 'WenQuanYi Zen Hei', sans-serif";

const INK = {
  ice: "#7ee0ff",
  amber: "#e8a23a",
  danger: "#ff4d5a",
  cream: "#f4efe4",
  bg: "#07090f",
  muted: "#9aa3b5",
};

function tintOf(tint: Tint): string {
  return INK[tint];
}

function blit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
  rotation: number,
  alpha = 1,
) {
  if (!img) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}

function fallbackShip(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, fill: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(-r * 0.8, r * 0.7);
  ctx.lineTo(-r * 0.4, 0);
  ctx.lineTo(-r * 0.8, -r * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function render(
  ctx: CanvasRenderingContext2D,
  g: Game,
  sprites: Sprites,
  dpr: number,
) {
  const w = g.w;
  const h = g.h;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = INK.bg;
  ctx.fillRect(0, 0, w, h);

  const nebula = ctx.createRadialGradient(w * 0.2, h * 0.3, 20, w * 0.25, h * 0.35, w * 0.55);
  nebula.addColorStop(0, "rgba(126, 224, 255, 0.08)");
  nebula.addColorStop(1, "rgba(126, 224, 255, 0)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, w, h);
  const ember = ctx.createRadialGradient(w * 0.8, h * 0.75, 10, w * 0.78, h * 0.72, w * 0.45);
  ember.addColorStop(0, "rgba(255, 77, 90, 0.07)");
  ember.addColorStop(1, "rgba(255, 77, 90, 0)");
  ctx.fillStyle = ember;
  ctx.fillRect(0, 0, w, h);

  const px = g.mode === "menu" ? 0 : (g.player.x - w * 0.5) / Math.max(w, 1);
  const py = g.mode === "menu" ? 0 : (g.player.y - h * 0.5) / Math.max(h, 1);
  const parallax = [10, 22, 40];
  ctx.save();
  const mag = g.reduce ? 0 : g.shake;
  if (mag > 0.2) {
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }

  for (const star of g.stars) {
    const ox = star.x - px * parallax[star.layer];
    const oy = star.y - py * parallax[star.layer];
    const x = ((ox % w) + w) % w;
    const y = ((oy % h) + h) % h;
    const tw = 0.45 + Math.sin(star.tw) * 0.35;
    ctx.globalAlpha = (star.layer === 0 ? 0.45 : star.layer === 1 ? 0.75 : 0.95) * (0.65 + tw * 0.35);
    ctx.fillStyle = star.layer === 2 ? INK.cream : INK.ice;
    if (star.layer === 2) {
      ctx.fillRect(x, y, 1.2, star.size * 7);
    }
    ctx.beginPath();
    ctx.arc(x, y, star.size * (0.7 + tw * 0.3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const pk of g.pickups) {
    if (!pk.alive) continue;
    const bob = Math.sin(g.time * 3 + pk.bob) * 4 * g.scale;
    const fade = pk.life < 2.4 ? 0.35 + Math.sin(g.time * 14) * 0.35 : 1;
    const color = pk.type === "shield" ? INK.ice : INK.amber;
    ctx.save();
    ctx.globalAlpha = Math.max(0.25, fade);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pk.x, pk.y + bob, pk.r + 6 * g.scale, 0, Math.PI * 2);
    ctx.stroke();
    const img = sprites[pk.type];
    const drew = blit(ctx, img, pk.x, pk.y + bob, pk.r * 2.5, 0, Math.max(0.35, fade));
    if (!drew) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pk.x, pk.y + bob, pk.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  for (const b of g.bullets) {
    if (!b.alive || b.friendly) continue;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = INK.danger;
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK.cream;
    ctx.beginPath();
    ctx.arc(0, 0, b.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const ordered = g.enemies.filter((e) => e.alive).sort((a, b) => a.y - b.y);
  for (const e of ordered) {
    const rot = e.aim + Math.PI / 2;
    const sprite = e.kind === "elite" ? sprites.cruiser : sprites[e.kind];
    const size = e.r * (e.kind === "elite" ? 2.7 : 2.55);
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + e.r * 0.72, e.r * 0.7, e.r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (e.kind === "elite") {
      ctx.save();
      ctx.strokeStyle = INK.amber;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 1.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    const drew = blit(ctx, sprite, e.x, e.y, size, rot, 1);
    if (!drew) fallbackShip(ctx, e.x, e.y, e.r, e.aim, INK.danger);
    if (e.flash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.85, e.flash * 8);
      ctx.fillStyle = INK.cream;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (e.hp < e.maxHp) {
      const bw = e.r * 1.7;
      const bh = 3;
      const bx = e.x - bw / 2;
      const by = e.y - e.r - 8;
      ctx.fillStyle = "rgba(7, 9, 15, 0.7)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = e.kind === "elite" ? INK.amber : INK.danger;
      ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), bh);
    }
  }

  for (const b of g.bullets) {
    if (!b.alive || !b.friendly) continue;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    ctx.fillStyle = INK.ice;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(-12 * g.scale, -1.7 * g.scale, 16 * g.scale, 3.4 * g.scale);
    ctx.fillStyle = INK.cream;
    ctx.fillRect(-4 * g.scale, -1 * g.scale, 8 * g.scale, 2 * g.scale);
    ctx.restore();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const fl of g.flashes) {
    if (!fl.alive) continue;
    const t = Math.max(0, fl.life / fl.max);
    ctx.save();
    ctx.translate(fl.x, fl.y);
    ctx.rotate(fl.angle);
    const radius = (fl.friendly ? 16 : 12) * g.scale * (0.6 + t);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    if (fl.friendly) {
      glow.addColorStop(0, `rgba(255,255,255,${0.9 * t})`);
      glow.addColorStop(0.45, `rgba(126,224,255,${0.55 * t})`);
    } else {
      glow.addColorStop(0, `rgba(255,220,180,${0.85 * t})`);
      glow.addColorStop(0.5, `rgba(255,77,90,${0.45 * t})`);
    }
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${t})`;
    ctx.beginPath();
    ctx.moveTo((fl.friendly ? 18 : 12) * g.scale, 0);
    ctx.lineTo(-6 * g.scale, 4 * g.scale);
    ctx.lineTo(-2 * g.scale, 0);
    ctx.lineTo(-6 * g.scale, -4 * g.scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  if (g.mode === "play" || g.mode === "pause" || g.mode === "over") {
    const p = g.player;
    const rot = p.aim + Math.PI / 2;
    const blink = p.iframe > 0 && Math.sin(p.iframe * 42) > 0 ? 0.4 : 1;
    ctx.save();
    ctx.globalAlpha = 0.3 * blink;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + p.r * 0.9, p.r * 0.85, p.r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const back = p.aim + Math.PI;
    const jetX = p.x + Math.cos(back) * p.r * 0.95;
    const jetY = p.y + Math.sin(back) * p.r * 0.95;
    const jet = ctx.createRadialGradient(jetX, jetY, 0, jetX, jetY, p.r);
    jet.addColorStop(0, p.speedT > 0 ? "rgba(244,239,228,0.9)" : "rgba(232,162,58,0.85)");
    jet.addColorStop(1, "rgba(232,162,58,0)");
    ctx.fillStyle = jet;
    ctx.globalAlpha = blink;
    ctx.beginPath();
    ctx.arc(jetX, jetY, p.r * (p.speedT > 0 ? 1.05 : 0.75), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    const drew = blit(ctx, sprites.player, p.x, p.y, p.r * 3.15, rot, blink);
    if (!drew) fallbackShip(ctx, p.x, p.y, p.r, p.aim, INK.ice);
    if (p.shieldT > 0) {
      const pulse = 1 + Math.sin(g.time * 7) * 0.04;
      ctx.save();
      ctx.strokeStyle = INK.ice;
      ctx.globalAlpha = 0.35 + Math.sin(g.time * 8) * 0.1;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 1.85 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = INK.ice;
      ctx.fill();
      ctx.restore();
    }
  }

  for (const part of g.particles) {
    if (!part.alive) continue;
    const a = Math.max(0, part.life / part.max);
    ctx.globalAlpha = a;
    ctx.fillStyle = tintOf(part.tint);
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.size * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of g.floaters) {
    if (!f.alive) continue;
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.fillStyle = tintOf(f.tint);
    ctx.font = `600 ${Math.round(15 * g.scale + 11)}px ${FONT}`;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  if ((g.mode === "play" || g.mode === "pause") && g.announceT > 0) {
    const alpha = Math.min(1, g.announceT / 0.35);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = INK.cream;
    ctx.font = `600 ${Math.round(28 * Math.min(1, g.scale + 0.2))}px ${FONT}`;
    ctx.fillText(g.announce, w * 0.5, h * 0.34);
    ctx.globalAlpha = 1;
  }

  let elite: (typeof g.enemies)[number] | null = null;
  for (const e of g.enemies) {
    if (e.alive && e.kind === "elite") elite = e;
  }
  if (elite && (g.mode === "play" || g.mode === "pause")) {
    const bw = Math.min(280, w * 0.46);
    const bx = (w - bw) / 2;
    const by = 78;
    ctx.fillStyle = "rgba(7,9,15,0.72)";
    ctx.fillRect(bx, by, bw, 8);
    ctx.fillStyle = INK.amber;
    ctx.fillRect(bx, by, bw * Math.max(0, elite.hp / elite.maxHp), 8);
    ctx.font = `500 12px ${FONT}`;
    ctx.fillStyle = INK.amber;
    ctx.fillText("旗舰", w * 0.5, by - 12);
  }

  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}
