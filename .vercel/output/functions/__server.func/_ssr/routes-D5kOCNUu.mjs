import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Pointer, d as Keyboard, f as Crosshair, i as Trophy, l as Play, n as VolumeX, o as Shield, r as Volume2, s as RotateCcw, t as Zap, u as Pause } from "../_libs/lucide-react.mjs";
import "./router-Dz1wSsnQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D5kOCNUu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var player_default = "/assets/player-CoLKvuQx.png";
var dart_default = "/assets/dart-BPmPXXPB.png";
var cruiser_default = "/assets/cruiser-aSOjkiMs.png";
var orb_default = "/assets/orb-BgD9N3kZ.png";
var multi_default = "/assets/multi-B37IrEka.png";
var shield_default = "/assets/shield-8rDord5Z.png";
var speed_default = "/assets/speed-UOabSgfC.png";
function createAudio() {
	let ctx = null;
	let master = null;
	let sfx = null;
	let muted = false;
	let voices = 0;
	function ensure() {
		if (ctx) return ctx;
		const context = new AudioContext({ latencyHint: "interactive" });
		const masterGain = context.createGain();
		const sfxGain = context.createGain();
		masterGain.gain.value = .9;
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
		if (context.state === "suspended") context.resume();
	}
	function resume() {
		if (ctx && ctx.state === "suspended") ctx.resume();
	}
	function setMuted(next) {
		muted = next;
		if (!master || !ctx) return;
		master.gain.setTargetAtTime(next ? 0 : .9, ctx.currentTime, .02);
	}
	function env(duration, peak) {
		const context = ctx;
		const gain = context.createGain();
		gain.connect(sfx);
		const t = context.currentTime;
		gain.gain.setValueAtTime(1e-4, t);
		gain.gain.exponentialRampToValueAtTime(Math.max(.001, peak), t + .012);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + Math.max(.03, duration));
		return gain;
	}
	function tone(freq, dur, type, peak, slide = 0) {
		if (!ctx || muted || voices > 16) return;
		const osc = ctx.createOscillator();
		const gain = env(dur, peak);
		osc.type = type;
		const start = Math.max(40, freq);
		osc.frequency.setValueAtTime(start, ctx.currentTime);
		if (slide !== 0) osc.frequency.exponentialRampToValueAtTime(Math.max(40, start + slide), ctx.currentTime + dur);
		osc.connect(gain);
		voices += 1;
		osc.onended = () => {
			voices = Math.max(0, voices - 1);
			osc.disconnect();
			gain.disconnect();
		};
		osc.start();
		osc.stop(ctx.currentTime + dur + .02);
	}
	function noise(dur, peak, highpass) {
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
	function play(name) {
		if (!ctx) return;
		const vary = .94 + Math.random() * .12;
		switch (name) {
			case "shot":
				tone(720 * vary, .055, "square", .03, -340);
				break;
			case "eshot":
				tone(210 * vary, .07, "sawtooth", .028, -70);
				break;
			case "hit":
				noise(.05, .045, 900);
				break;
			case "explode":
				noise(.24, .1, 180);
				tone(130, .22, "sine", .07, -80);
				break;
			case "hurt":
				tone(380, .16, "sawtooth", .055, -240);
				break;
			case "pickup":
				tone(523, .07, "square", .045);
				tone(784, .12, "square", .04);
				break;
			case "block":
				tone(860, .09, "sine", .05, 220);
				break;
			case "wave":
				tone(494, .1, "sine", .05);
				tone(740, .16, "sine", .045);
				break;
			case "over":
				tone(280, .32, "sawtooth", .06, -160);
				noise(.28, .07, 240);
		}
	}
	return {
		unlock,
		resume,
		setMuted,
		play
	};
}
var FONT = "Outfit, 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', 'WenQuanYi Zen Hei', sans-serif";
var INK = {
	ice: "#7ee0ff",
	amber: "#e8a23a",
	danger: "#ff4d5a",
	cream: "#f4efe4",
	bg: "#07090f",
	muted: "#9aa3b5"
};
function tintOf(tint) {
	return INK[tint];
}
function blit(ctx, img, x, y, size, rotation, alpha = 1) {
	if (!img) return false;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(rotation);
	ctx.globalAlpha = alpha;
	ctx.drawImage(img, -size / 2, -size / 2, size, size);
	ctx.restore();
	return true;
}
function fallbackShip(ctx, x, y, r, rot, fill) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(rot);
	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.moveTo(r, 0);
	ctx.lineTo(-r * .8, r * .7);
	ctx.lineTo(-r * .4, 0);
	ctx.lineTo(-r * .8, -r * .7);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}
function render(ctx, g, sprites, dpr) {
	const w = g.w;
	const h = g.h;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = INK.bg;
	ctx.fillRect(0, 0, w, h);
	const nebula = ctx.createRadialGradient(w * .2, h * .3, 20, w * .25, h * .35, w * .55);
	nebula.addColorStop(0, "rgba(126, 224, 255, 0.08)");
	nebula.addColorStop(1, "rgba(126, 224, 255, 0)");
	ctx.fillStyle = nebula;
	ctx.fillRect(0, 0, w, h);
	const ember = ctx.createRadialGradient(w * .8, h * .75, 10, w * .78, h * .72, w * .45);
	ember.addColorStop(0, "rgba(255, 77, 90, 0.07)");
	ember.addColorStop(1, "rgba(255, 77, 90, 0)");
	ctx.fillStyle = ember;
	ctx.fillRect(0, 0, w, h);
	const px = g.mode === "menu" ? 0 : (g.player.x - w * .5) / Math.max(w, 1);
	const py = g.mode === "menu" ? 0 : (g.player.y - h * .5) / Math.max(h, 1);
	const parallax = [
		10,
		22,
		40
	];
	ctx.save();
	const mag = g.reduce ? 0 : g.shake;
	if (mag > .2) ctx.translate((Math.random() - .5) * mag, (Math.random() - .5) * mag);
	for (const star of g.stars) {
		const ox = star.x - px * parallax[star.layer];
		const oy = star.y - py * parallax[star.layer];
		const x = (ox % w + w) % w;
		const y = (oy % h + h) % h;
		const tw = .45 + Math.sin(star.tw) * .35;
		ctx.globalAlpha = (star.layer === 0 ? .45 : star.layer === 1 ? .75 : .95) * (.65 + tw * .35);
		ctx.fillStyle = star.layer === 2 ? INK.cream : INK.ice;
		if (star.layer === 2) ctx.fillRect(x, y, 1.2, star.size * 7);
		ctx.beginPath();
		ctx.arc(x, y, star.size * (.7 + tw * .3), 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
	for (const pk of g.pickups) {
		if (!pk.alive) continue;
		const bob = Math.sin(g.time * 3 + pk.bob) * 4 * g.scale;
		const fade = pk.life < 2.4 ? .35 + Math.sin(g.time * 14) * .35 : 1;
		const color = pk.type === "shield" ? INK.ice : INK.amber;
		ctx.save();
		ctx.globalAlpha = Math.max(.25, fade);
		ctx.strokeStyle = color;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(pk.x, pk.y + bob, pk.r + 6 * g.scale, 0, Math.PI * 2);
		ctx.stroke();
		const img = sprites[pk.type];
		if (!blit(ctx, img, pk.x, pk.y + bob, pk.r * 2.5, 0, Math.max(.35, fade))) {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(pk.x, pk.y + bob, pk.r * .7, 0, Math.PI * 2);
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
		ctx.arc(0, 0, b.r * .4, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
	const ordered = g.enemies.filter((e) => e.alive).sort((a, b) => a.y - b.y);
	for (const e of ordered) {
		const rot = e.aim + Math.PI / 2;
		const sprite = e.kind === "elite" ? sprites.cruiser : sprites[e.kind];
		const size = e.r * (e.kind === "elite" ? 2.7 : 2.55);
		ctx.save();
		ctx.globalAlpha = .28;
		ctx.fillStyle = "#000";
		ctx.beginPath();
		ctx.ellipse(e.x, e.y + e.r * .72, e.r * .7, e.r * .28, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		if (e.kind === "elite") {
			ctx.save();
			ctx.strokeStyle = INK.amber;
			ctx.globalAlpha = .8;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(e.x, e.y, e.r * 1.15, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}
		if (!blit(ctx, sprite, e.x, e.y, size, rot, 1)) fallbackShip(ctx, e.x, e.y, e.r, e.aim, INK.danger);
		if (e.flash > 0) {
			ctx.save();
			ctx.globalAlpha = Math.min(.85, e.flash * 8);
			ctx.fillStyle = INK.cream;
			ctx.beginPath();
			ctx.arc(e.x, e.y, e.r * .7, 0, Math.PI * 2);
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
		ctx.globalAlpha = .9;
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
		const radius = (fl.friendly ? 16 : 12) * g.scale * (.6 + t);
		const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
		if (fl.friendly) {
			glow.addColorStop(0, `rgba(255,255,255,${.9 * t})`);
			glow.addColorStop(.45, `rgba(126,224,255,${.55 * t})`);
		} else {
			glow.addColorStop(0, `rgba(255,220,180,${.85 * t})`);
			glow.addColorStop(.5, `rgba(255,77,90,${.45 * t})`);
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
		const blink = p.iframe > 0 && Math.sin(p.iframe * 42) > 0 ? .4 : 1;
		ctx.save();
		ctx.globalAlpha = .3 * blink;
		ctx.fillStyle = "#000";
		ctx.beginPath();
		ctx.ellipse(p.x, p.y + p.r * .9, p.r * .85, p.r * .32, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		const back = p.aim + Math.PI;
		const jetX = p.x + Math.cos(back) * p.r * .95;
		const jetY = p.y + Math.sin(back) * p.r * .95;
		const jet = ctx.createRadialGradient(jetX, jetY, 0, jetX, jetY, p.r);
		jet.addColorStop(0, p.speedT > 0 ? "rgba(244,239,228,0.9)" : "rgba(232,162,58,0.85)");
		jet.addColorStop(1, "rgba(232,162,58,0)");
		ctx.fillStyle = jet;
		ctx.globalAlpha = blink;
		ctx.beginPath();
		ctx.arc(jetX, jetY, p.r * (p.speedT > 0 ? 1.05 : .75), 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1;
		if (!blit(ctx, sprites.player, p.x, p.y, p.r * 3.15, rot, blink)) fallbackShip(ctx, p.x, p.y, p.r, p.aim, INK.ice);
		if (p.shieldT > 0) {
			const pulse = 1 + Math.sin(g.time * 7) * .04;
			ctx.save();
			ctx.strokeStyle = INK.ice;
			ctx.globalAlpha = .35 + Math.sin(g.time * 8) * .1;
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r * 1.85 * pulse, 0, Math.PI * 2);
			ctx.stroke();
			ctx.globalAlpha = .12;
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
		ctx.globalAlpha = Math.min(1, g.announceT / .35);
		ctx.fillStyle = INK.cream;
		ctx.font = `600 ${Math.round(28 * Math.min(1, g.scale + .2))}px ${FONT}`;
		ctx.fillText(g.announce, w * .5, h * .34);
		ctx.globalAlpha = 1;
	}
	let elite = null;
	for (const e of g.enemies) if (e.alive && e.kind === "elite") elite = e;
	if (elite && (g.mode === "play" || g.mode === "pause")) {
		const bw = Math.min(280, w * .46);
		const bx = (w - bw) / 2;
		const by = 78;
		ctx.fillStyle = "rgba(7,9,15,0.72)";
		ctx.fillRect(bx, by, bw, 8);
		ctx.fillStyle = INK.amber;
		ctx.fillRect(bx, by, bw * Math.max(0, elite.hp / elite.maxHp), 8);
		ctx.font = `500 12px ${FONT}`;
		ctx.fillStyle = INK.amber;
		ctx.fillText("旗舰", w * .5, 66);
	}
	const vignette = ctx.createRadialGradient(w * .5, h * .5, Math.min(w, h) * .35, w * .5, h * .5, Math.max(w, h) * .72);
	vignette.addColorStop(0, "rgba(0,0,0,0)");
	vignette.addColorStop(1, "rgba(0,0,0,0.45)");
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
}
var KEY = "chiyao.scores.v1";
var MUTE = "chiyao.mute.v1";
function empty() {
	return [];
}
function loadScores() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return empty();
		const data = JSON.parse(raw);
		if (!data || data.version !== 1 || !Array.isArray(data.rows)) return empty();
		return data.rows.filter((row) => row && typeof row.score === "number" && typeof row.wave === "number").slice(0, 8);
	} catch {
		return empty();
	}
}
function submitScore(score, wave) {
	const row = {
		score: Math.max(0, Math.round(score)),
		wave,
		at: Date.now()
	};
	const rows = loadScores();
	rows.push(row);
	rows.sort((a, b) => b.score - a.score || b.wave - a.wave || a.at - b.at);
	const kept = rows.slice(0, 8);
	const rankIndex = kept.indexOf(row);
	try {
		const save = {
			version: 1,
			rows: kept
		};
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
	return {
		rows: kept,
		rank: rankIndex >= 0 ? rankIndex + 1 : null
	};
}
function loadMute() {
	try {
		return localStorage.getItem(MUTE) === "1";
	} catch {
		return false;
	}
}
function saveMute(muted) {
	try {
		localStorage.setItem(MUTE, muted ? "1" : "0");
	} catch {}
}
var BULLETS = 280;
var ENEMIES = 20;
var PICKUPS = 10;
var PARTICLES = 200;
var FLOATERS = 18;
var FLASHES = 24;
var SFX_CAP = 10;
var spawnClock = /* @__PURE__ */ new WeakMap();
function bullet() {
	return {
		alive: false,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		r: 4,
		friendly: true,
		dmg: 1,
		life: 0
	};
}
function enemy() {
	return {
		alive: false,
		kind: "dart",
		x: 0,
		y: 0,
		r: 16,
		hp: 1,
		maxHp: 1,
		speed: 80,
		aim: 0,
		fireCd: 1,
		fireEvery: 1.4,
		range: 500,
		flash: 0,
		touchCd: 0,
		entered: false,
		phase: 0,
		spin: 1
	};
}
function pickup() {
	return {
		alive: false,
		type: "multi",
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		r: 16,
		life: 0,
		bob: 0
	};
}
function particle() {
	return {
		alive: false,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		life: 0,
		max: 1,
		size: 2,
		tint: "ice"
	};
}
function floater() {
	return {
		alive: false,
		x: 0,
		y: 0,
		life: 0,
		max: 1,
		text: "",
		tint: "cream"
	};
}
function flash() {
	return {
		alive: false,
		x: 0,
		y: 0,
		angle: 0,
		life: 0,
		max: .06,
		friendly: true
	};
}
function createGame() {
	return {
		w: 0,
		h: 0,
		scale: 1,
		mode: "menu",
		time: 0,
		reduce: typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
		player: {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			aim: -Math.PI / 2,
			hp: 100,
			maxHp: 100,
			r: 18,
			fireCd: 0,
			iframe: 0,
			multiT: 0,
			multiLevel: 0,
			shieldT: 0,
			speedT: 0
		},
		bullets: Array.from({ length: BULLETS }, bullet),
		enemies: Array.from({ length: ENEMIES }, enemy),
		pickups: Array.from({ length: PICKUPS }, pickup),
		particles: Array.from({ length: PARTICLES }, particle),
		floaters: Array.from({ length: FLOATERS }, floater),
		flashes: Array.from({ length: FLASHES }, flash),
		stars: [],
		queue: [],
		qIndex: 0,
		wave: 1,
		intro: 0,
		announce: "",
		announceT: 0,
		score: 0,
		combo: 0,
		comboT: 0,
		sinceDrop: 0,
		shake: 0,
		hitStop: 0,
		keys: /* @__PURE__ */ new Set(),
		qa: null,
		pointer: {
			x: 0,
			y: 0,
			active: false,
			qa: false
		},
		sfx: [],
		sfxN: 0
	};
}
function pushSfx(g, name) {
	if (g.sfxN < SFX_CAP) g.sfx[g.sfxN++] = name;
}
function drainSfx(g) {
	const out = g.sfx.slice(0, g.sfxN);
	g.sfxN = 0;
	return out;
}
function fillStars(g) {
	g.stars.length = 0;
	const count = 130;
	for (let i = 0; i < count; i += 1) {
		const layer = i % 11 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
		g.stars.push({
			x: Math.random() * Math.max(g.w, 1),
			y: Math.random() * Math.max(g.h, 1),
			layer,
			size: layer === 2 ? 2.1 : layer === 1 ? 1.45 : 1,
			tw: Math.random() * Math.PI * 2
		});
	}
}
function resizeGame(g, w, h) {
	const nextW = Math.max(1, w);
	const nextH = Math.max(1, h);
	const first = g.w < 2 || g.h < 2;
	const prevW = g.w;
	const prevH = g.h;
	g.w = nextW;
	g.h = nextH;
	g.scale = Math.min(1.15, Math.max(.62, Math.min(nextW, nextH) / 780));
	g.player.r = 18 * g.scale;
	if (first || g.stars.length === 0) {
		fillStars(g);
		return;
	}
	const sx = nextW / prevW;
	const sy = nextH / prevH;
	for (const star of g.stars) {
		star.x *= sx;
		star.y *= sy;
	}
	if (g.mode === "play" || g.mode === "pause") {
		g.player.x = Math.min(nextW - 24, Math.max(24, g.player.x * sx));
		g.player.y = Math.min(nextH - 24, Math.max(24, g.player.y * sy));
	}
}
function killAll(list) {
	for (const item of list) item.alive = false;
}
function planWave(wave) {
	const out = [];
	const darts = Math.min(16, 4 + wave * 2);
	const orbs = wave >= 2 ? Math.min(8, 1 + Math.floor(wave * .75)) : 0;
	const cruisers = wave >= 3 ? Math.min(4, Math.floor((wave - 1) / 2)) : 0;
	for (let i = 0; i < darts; i += 1) out.push("dart");
	for (let i = 0; i < orbs; i += 1) out.push("orb");
	for (let i = 0; i < cruisers; i += 1) out.push("cruiser");
	if (wave % 5 === 0) out.push("elite");
	for (let i = out.length - 1; i > 0; i -= 1) {
		const j = Math.random() * (i + 1) | 0;
		const tmp = out[i];
		out[i] = out[j];
		out[j] = tmp;
	}
	return out;
}
function beginWave(g, wave) {
	g.wave = wave;
	g.intro = wave === 1 ? .85 : 1.55;
	g.announce = wave % 5 === 0 ? `第 ${wave} 波 · 旗舰` : `第 ${wave} 波`;
	g.announceT = g.intro;
	g.queue = planWave(wave);
	g.qIndex = 0;
	spawnClock.set(g, .2);
}
function startRun(g) {
	killAll(g.bullets);
	killAll(g.enemies);
	killAll(g.pickups);
	killAll(g.particles);
	killAll(g.floaters);
	killAll(g.flashes);
	g.score = 0;
	g.combo = 0;
	g.comboT = 0;
	g.sinceDrop = 0;
	g.shake = 0;
	g.hitStop = 0;
	g.time = 0;
	const p = g.player;
	p.x = g.w * .5;
	p.y = g.h * .7;
	p.vx = 0;
	p.vy = 0;
	p.aim = -Math.PI / 2;
	p.hp = p.maxHp;
	p.fireCd = .2;
	p.iframe = .4;
	p.multiT = 0;
	p.multiLevel = 0;
	p.shieldT = 0;
	p.speedT = 0;
	g.mode = "play";
	beginWave(g, 1);
}
function togglePause(g) {
	if (g.mode === "play") g.mode = "pause";
	else if (g.mode === "pause") g.mode = "play";
}
function goMenu(g) {
	g.mode = "menu";
	g.shake = 0;
}
function takeSlot(list) {
	for (const item of list) if (!item.alive) return item;
	return null;
}
function burst(g, x, y, tint, count, speed) {
	for (let i = 0; i < count; i += 1) {
		const p = takeSlot(g.particles);
		if (!p) return;
		const a = Math.random() * Math.PI * 2;
		const s = speed * (.35 + Math.random() * .85);
		p.alive = true;
		p.x = x;
		p.y = y;
		p.vx = Math.cos(a) * s;
		p.vy = Math.sin(a) * s;
		p.life = .28 + Math.random() * .28;
		p.max = p.life;
		p.size = (1.6 + Math.random() * 2.4) * g.scale;
		p.tint = tint;
	}
}
function pushText(g, x, y, text, tint) {
	const f = takeSlot(g.floaters);
	if (!f) return;
	f.alive = true;
	f.x = x;
	f.y = y;
	f.text = text;
	f.tint = tint;
	f.life = .8;
	f.max = .8;
}
function addFlash(g, x, y, angle, friendly) {
	const f = takeSlot(g.flashes);
	if (!f) return;
	f.alive = true;
	f.x = x;
	f.y = y;
	f.angle = angle;
	f.friendly = friendly;
	f.max = friendly ? .07 : .09;
	f.life = f.max;
}
function shoot(g, x, y, angle, speed, dmg, friendly, radius) {
	const b = takeSlot(g.bullets);
	if (!b) return;
	b.alive = true;
	b.x = x;
	b.y = y;
	b.vx = Math.cos(angle) * speed;
	b.vy = Math.sin(angle) * speed;
	b.r = radius;
	b.friendly = friendly;
	b.dmg = dmg;
	b.life = friendly ? 1.05 : 3.4;
}
function firePlayer(g) {
	const p = g.player;
	const nose = p.r + 10 * g.scale;
	const x = p.x + Math.cos(p.aim) * nose;
	const y = p.y + Math.sin(p.aim) * nose;
	const level = p.multiT > 0 ? p.multiLevel : 0;
	const spreads = level >= 2 ? [
		-.34,
		-.17,
		0,
		.17,
		.34
	] : level === 1 ? [
		-.18,
		0,
		.18
	] : [0];
	const speed = 860 * g.scale;
	for (const offset of spreads) shoot(g, x, y, p.aim + offset, speed, 11, true, 3.3 * g.scale);
	addFlash(g, x, y, p.aim, true);
	burst(g, x, y, "ice", 3, 80 * g.scale);
	pushSfx(g, "shot");
}
function spawnPickup(g, x, y, type) {
	const pk = takeSlot(g.pickups);
	if (!pk) return;
	pk.alive = true;
	pk.type = type;
	pk.x = x;
	pk.y = y;
	pk.vx = (Math.random() - .5) * 24 * g.scale;
	pk.vy = (Math.random() - .5) * 24 * g.scale;
	pk.r = 16 * g.scale;
	pk.life = 12;
	pk.bob = Math.random() * Math.PI * 2;
}
function randomPickup() {
	const roll = Math.random();
	if (roll < .38) return "multi";
	if (roll < .7) return "shield";
	return "speed";
}
function killEnemy(g, e) {
	e.alive = false;
	const base = e.kind === "dart" ? 100 : e.kind === "orb" ? 150 : e.kind === "cruiser" ? 280 : 720;
	const mult = 1 + Math.min(8, g.combo) * .12;
	const gained = Math.round(base * mult);
	g.score += gained;
	g.combo += 1;
	g.comboT = 1.65;
	g.sinceDrop += 1;
	const tint = e.kind === "dart" ? "danger" : e.kind === "orb" ? "amber" : "cream";
	burst(g, e.x, e.y, tint, e.kind === "elite" ? 22 : 12, (e.kind === "elite" ? 220 : 160) * g.scale);
	pushText(g, e.x, e.y - 10, `+${gained}`, "cream");
	pushSfx(g, "explode");
	if (!g.reduce) {
		g.shake = Math.max(g.shake, e.kind === "elite" ? 11 : e.kind === "cruiser" ? 6 : 3);
		g.hitStop = Math.max(g.hitStop, e.kind === "elite" ? .07 : e.kind === "cruiser" ? .04 : .02);
	}
	if (g.sinceDrop >= 7 || Math.random() < .22) {
		g.sinceDrop = 0;
		spawnPickup(g, e.x, e.y, randomPickup());
	}
}
function hurtPlayer(g, dmg) {
	const p = g.player;
	if (g.mode !== "play" || p.iframe > 0 || p.hp <= 0) return;
	if (p.shieldT > 0) {
		p.shieldT = Math.max(0, p.shieldT - .45);
		if (!g.reduce) g.shake = Math.max(g.shake, 3.5);
		burst(g, p.x, p.y, "ice", 6, 120 * g.scale);
		pushSfx(g, "block");
		return;
	}
	p.hp = Math.max(0, p.hp - dmg);
	p.iframe = 1.05;
	if (!g.reduce) g.shake = Math.max(g.shake, 10);
	burst(g, p.x, p.y, "danger", 8, 140 * g.scale);
	pushSfx(g, "hurt");
	if (p.hp <= 0) {
		p.hp = 0;
		g.mode = "over";
		burst(g, p.x, p.y, "ice", 24, 240 * g.scale);
		pushSfx(g, "over");
	}
}
function spawnEnemy(g, kind) {
	const e = takeSlot(g.enemies);
	if (!e) return;
	const wave = g.wave;
	const s = g.scale;
	const hpScale = 1 + (wave - 1) * .1;
	const speedScale = s * (1 + (wave - 1) * .045);
	let hp = 36;
	let r = 16 * s;
	let speed = 120 * speedScale;
	let fireEvery = 1.5;
	let range = 640 * s;
	if (kind === "orb") {
		hp = 54;
		r = 18 * s;
		speed = 72 * speedScale;
		fireEvery = 2.2;
		range = 720 * s;
	} else if (kind === "cruiser") {
		hp = 156;
		r = 30 * s;
		speed = 50 * speedScale;
		fireEvery = 1.75;
		range = 780 * s;
	} else if (kind === "elite") {
		hp = 440;
		r = 42 * s;
		speed = 44 * speedScale;
		fireEvery = 1.35;
		range = 920 * s;
	}
	const margin = r + 28;
	let x = g.w * .5;
	let y = -margin;
	for (let attempt = 0; attempt < 8; attempt += 1) {
		const side = Math.random() * 4 | 0;
		if (side === 0) {
			x = margin + Math.random() * (g.w - margin * 2);
			y = -margin;
		} else if (side === 1) {
			x = g.w + margin;
			y = margin + Math.random() * (g.h - margin * 2);
		} else if (side === 2) {
			x = margin + Math.random() * (g.w - margin * 2);
			y = g.h + margin;
		} else {
			x = -margin;
			y = margin + Math.random() * (g.h - margin * 2);
		}
		if (Math.hypot(x - g.player.x, y - g.player.y) > 240 * s) break;
	}
	e.alive = true;
	e.kind = kind;
	e.x = x;
	e.y = y;
	e.r = r;
	e.maxHp = hp * hpScale;
	e.hp = e.maxHp;
	e.speed = speed;
	e.aim = Math.atan2(g.player.y - y, g.player.x - x);
	e.fireCd = .45 + Math.random() * .8;
	e.fireEvery = fireEvery * Math.max(.62, 1 - (wave - 1) * .03);
	e.range = range;
	e.flash = 0;
	e.touchCd = .4;
	e.entered = false;
	e.phase = Math.random() * Math.PI * 2;
	e.spin = Math.random() < .5 ? -1 : 1;
}
function fireEnemy(g, e) {
	const aim = Math.atan2(g.player.y - e.y, g.player.x - e.x);
	const dmgScale = 1 + (g.wave - 1) * .05;
	const nose = e.r * .85;
	const x = e.x + Math.cos(aim) * nose;
	const y = e.y + Math.sin(aim) * nose;
	if (e.kind === "dart") shoot(g, x, y, aim, 270 * g.scale, 9 * dmgScale, false, 4.4 * g.scale);
	else if (e.kind === "orb") for (let i = 0; i < 6; i += 1) {
		const a = e.phase + i * Math.PI / 3;
		shoot(g, e.x, e.y, a, 175 * g.scale, 8 * dmgScale, false, 4.8 * g.scale);
	}
	else if (e.kind === "cruiser") for (const offset of [
		-.24,
		0,
		.24
	]) shoot(g, x, y, aim + offset, 230 * g.scale, 12 * dmgScale, false, 5 * g.scale);
	else for (const offset of [
		-.32,
		-.16,
		0,
		.16,
		.32
	]) shoot(g, x, y, aim + offset, 250 * g.scale, 13 * dmgScale, false, 5.2 * g.scale);
	addFlash(g, x, y, aim, false);
	pushSfx(g, "eshot");
}
function updateEnemy(g, e, dt) {
	const p = g.player;
	let sx = 0;
	let sy = 0;
	for (const other of g.enemies) {
		if (!other.alive || other === e) continue;
		const ox = e.x - other.x;
		const oy = e.y - other.y;
		const d = Math.hypot(ox, oy);
		const min = e.r + other.r + 12 * g.scale;
		if (d > .001 && d < min) {
			sx += ox / d * (min - d);
			sy += oy / d * (min - d);
		}
	}
	const dx = p.x - e.x;
	const dy = p.y - e.y;
	const dist = Math.hypot(dx, dy) || 1;
	const ux = dx / dist;
	const uy = dy / dist;
	let vx = ux * e.speed;
	let vy = uy * e.speed;
	if (e.kind === "orb") {
		vx = ux * e.speed * .45 + -uy * e.speed * e.spin;
		vy = uy * e.speed * .45 + ux * e.speed * e.spin;
	} else if (e.kind === "dart") {
		const weave = Math.sin(g.time * 2.4 + e.phase);
		vx += -uy * weave * 46 * g.scale;
		vy += ux * weave * 46 * g.scale;
	}
	vx += sx * 4;
	vy += sy * 4;
	e.x += vx * dt;
	e.y += vy * dt;
	if (e.x > e.r && e.y > e.r && e.x < g.w - e.r && e.y < g.h - e.r) e.entered = true;
	if (e.entered) {
		const m = 8;
		if (e.x < e.r + m) e.x = e.r + m;
		if (e.y < e.r + m) e.y = e.r + m;
		if (e.x > g.w - e.r - m) e.x = g.w - e.r - m;
		if (e.y > g.h - e.r - m) e.y = g.h - e.r - m;
	}
	const desired = Math.atan2(dy, dx);
	const ad = Math.atan2(Math.sin(desired - e.aim), Math.cos(desired - e.aim));
	e.aim += ad * Math.min(1, dt * 7);
	e.flash = Math.max(0, e.flash - dt);
	e.touchCd = Math.max(0, e.touchCd - dt);
	if (!e.entered) return;
	e.fireCd -= dt;
	if (e.fireCd <= 0 && dist < e.range) {
		e.fireCd = e.fireEvery;
		fireEnemy(g, e);
	}
}
function axes(g) {
	const src = g.qa ?? g.keys;
	let x = 0;
	let y = 0;
	if (src.has("KeyA") || src.has("ArrowLeft")) x -= 1;
	if (src.has("KeyD") || src.has("ArrowRight")) x += 1;
	if (src.has("KeyW") || src.has("ArrowUp")) y -= 1;
	if (src.has("KeyS") || src.has("ArrowDown")) y += 1;
	const len = Math.hypot(x, y);
	if (len > 0) return {
		x: x / len,
		y: y / len
	};
	if (g.qa) return {
		x: 0,
		y: 0
	};
	if (g.pointer.active) {
		const dx = g.pointer.x - g.player.x;
		const dy = g.pointer.y - g.player.y;
		const d = Math.hypot(dx, dy);
		const dead = 14 * g.scale;
		if (d > dead) {
			const ease = Math.min(1, (d - dead) / (96 * g.scale));
			return {
				x: dx / d * ease,
				y: dy / d * ease
			};
		}
	}
	return {
		x: 0,
		y: 0
	};
}
function updatePlayer(g, dt) {
	const p = g.player;
	const move = axes(g);
	const max = 360 * g.scale * (p.speedT > 0 ? 1.58 : 1);
	const desiredX = move.x * max;
	const desiredY = move.y * max;
	const rate = p.speedT > 0 ? 16 : 11;
	const k = 1 - Math.exp(-rate * dt);
	p.vx += (desiredX - p.vx) * k;
	p.vy += (desiredY - p.vy) * k;
	p.x += p.vx * dt;
	p.y += p.vy * dt;
	const top = 76;
	const bot = 88;
	const side = 18;
	if (p.x < side) {
		p.x = side;
		p.vx = Math.max(0, p.vx);
	} else if (p.x > g.w - side) {
		p.x = g.w - side;
		p.vx = Math.min(0, p.vx);
	}
	if (p.y < top) {
		p.y = top;
		p.vy = Math.max(0, p.vy);
	} else if (p.y > g.h - bot) {
		p.y = g.h - bot;
		p.vy = Math.min(0, p.vy);
	}
	let target = -Math.PI / 2;
	let best = Number.POSITIVE_INFINITY;
	let found = false;
	for (const e of g.enemies) {
		if (!e.alive) continue;
		const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
		if (d < best) {
			best = d;
			target = Math.atan2(e.y - p.y, e.x - p.x);
			found = true;
		}
	}
	if (!found) target = p.aim;
	const ad = Math.atan2(Math.sin(target - p.aim), Math.cos(target - p.aim));
	p.aim += ad * (1 - Math.exp(-12 * dt));
	p.fireCd -= dt;
	if (p.fireCd <= 0) {
		p.fireCd = p.multiT > 0 ? .13 : .15;
		firePlayer(g);
	}
	p.iframe = Math.max(0, p.iframe - dt);
	p.multiT = Math.max(0, p.multiT - dt);
	if (p.multiT <= 0) p.multiLevel = 0;
	p.shieldT = Math.max(0, p.shieldT - dt);
	p.speedT = Math.max(0, p.speedT - dt);
	if (Math.hypot(p.vx, p.vy) > 40 * g.scale && Math.random() < dt * 28) {
		const back = p.aim + Math.PI;
		const jet = takeSlot(g.particles);
		if (jet) {
			jet.alive = true;
			jet.x = p.x + Math.cos(back) * p.r * .85;
			jet.y = p.y + Math.sin(back) * p.r * .85;
			jet.vx = Math.cos(back) * 40 * g.scale + (Math.random() - .5) * 20;
			jet.vy = Math.sin(back) * 40 * g.scale + (Math.random() - .5) * 20;
			jet.life = .22;
			jet.max = .22;
			jet.size = 2.4 * g.scale;
			jet.tint = p.speedT > 0 ? "cream" : "amber";
		}
	}
}
function takePickup(g, type) {
	const p = g.player;
	if (type === "multi") {
		p.multiLevel = p.multiT > 0 ? 2 : 1;
		p.multiT = 9;
		pushText(g, p.x, p.y - 28 * g.scale, p.multiLevel >= 2 ? "五重射击" : "三重射击", "amber");
	} else if (type === "shield") {
		p.shieldT = 7.5;
		pushText(g, p.x, p.y - 28 * g.scale, "护盾", "ice");
	} else {
		p.speedT = 8;
		pushText(g, p.x, p.y - 28 * g.scale, "加速", "amber");
	}
	pushSfx(g, "pickup");
}
function updateStars(g, dt) {
	const slow = g.reduce ? .35 : 1;
	const speeds = [
		16,
		38,
		72
	];
	for (const star of g.stars) {
		star.y += speeds[star.layer] * g.scale * slow * dt;
		star.tw += dt * (.8 + star.layer);
		if (star.y > g.h + 4) {
			star.y = -4;
			star.x = Math.random() * g.w;
		}
	}
}
function maybeAdvance(g) {
	if (g.intro > 0) return;
	if (g.qIndex < g.queue.length) return;
	for (const e of g.enemies) if (e.alive) return;
	const bonus = 160 + g.wave * 50;
	g.score += bonus;
	g.player.hp = Math.min(g.player.maxHp, g.player.hp + 14);
	pushText(g, g.w * .5, g.h * .42, `波次奖励 +${bonus}`, "amber");
	spawnPickup(g, g.w * .5 + (Math.random() - .5) * 80, g.h * .46, randomPickup());
	pushSfx(g, "wave");
	beginWave(g, g.wave + 1);
}
function updateFx(g, dt) {
	for (const part of g.particles) {
		if (!part.alive) continue;
		part.x += part.vx * dt;
		part.y += part.vy * dt;
		part.life -= dt;
		if (part.life <= 0) part.alive = false;
	}
	for (const f of g.floaters) {
		if (!f.alive) continue;
		f.y -= 28 * g.scale * dt;
		f.life -= dt;
		if (f.life <= 0) f.alive = false;
	}
	for (const fl of g.flashes) {
		if (!fl.alive) continue;
		fl.life -= dt;
		if (fl.life <= 0) fl.alive = false;
	}
}
function step(g, dt) {
	if (g.mode !== "pause") updateStars(g, dt);
	g.time += dt;
	if (g.mode === "over") {
		updateFx(g, dt);
		g.shake *= Math.exp(-4.4 * dt);
		return;
	}
	if (g.mode !== "play") return;
	g.shake *= Math.exp(-4.4 * dt);
	if (g.hitStop > 0) {
		g.hitStop -= dt;
		return;
	}
	g.intro = Math.max(0, g.intro - dt);
	g.announceT = Math.max(0, g.announceT - dt);
	g.comboT = Math.max(0, g.comboT - dt);
	if (g.comboT <= 0) g.combo = 0;
	updatePlayer(g, dt);
	if (g.mode !== "play") return;
	tickSpawns(g, dt);
	for (const e of g.enemies) if (e.alive) updateEnemy(g, e, dt);
	if (g.mode !== "play") return;
	for (const b of g.bullets) {
		if (!b.alive) continue;
		b.x += b.vx * dt;
		b.y += b.vy * dt;
		b.life -= dt;
		const margin = 80;
		if (b.life <= 0 || b.x < -80 || b.y < -80 || b.x > g.w + margin || b.y > g.h + margin) b.alive = false;
	}
	for (const pk of g.pickups) {
		if (!pk.alive) continue;
		pk.life -= dt;
		const dx = g.player.x - pk.x;
		const dy = g.player.y - pk.y;
		const d = Math.hypot(dx, dy);
		if (d < 130 * g.scale && d > 1) {
			pk.x += dx / d * 140 * g.scale * dt;
			pk.y += dy / d * 140 * g.scale * dt;
		} else {
			pk.x += pk.vx * dt;
			pk.y += pk.vy * dt;
		}
		if (pk.life <= 0) pk.alive = false;
		else if (d < g.player.r + pk.r) {
			pk.alive = false;
			takePickup(g, pk.type);
		}
	}
	const p = g.player;
	for (const b of g.bullets) {
		if (!b.alive || !b.friendly) continue;
		for (const e of g.enemies) {
			if (!e.alive) continue;
			const hit = e.r * .78 + b.r;
			if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 <= hit * hit) {
				b.alive = false;
				e.hp -= b.dmg;
				e.flash = .08;
				burst(g, b.x, b.y, "cream", 3, 70 * g.scale);
				if (e.hp <= 0) killEnemy(g, e);
				else pushSfx(g, "hit");
				break;
			}
		}
	}
	if (g.mode !== "play") return;
	for (const b of g.bullets) {
		if (!b.alive || b.friendly) continue;
		const hit = p.r * .72 + b.r;
		if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 <= hit * hit) {
			b.alive = false;
			hurtPlayer(g, b.dmg);
			if (g.mode !== "play") return;
		}
	}
	for (const e of g.enemies) {
		if (!e.alive || e.touchCd > 0) continue;
		const hit = e.r * .72 + p.r * .72;
		if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 <= hit * hit) {
			e.touchCd = .85;
			const dmg = e.kind === "elite" ? 26 : e.kind === "cruiser" ? 20 : 16;
			const nx = e.x - p.x;
			const ny = e.y - p.y;
			const nd = Math.hypot(nx, ny) || 1;
			e.x += nx / nd * 18 * g.scale;
			e.y += ny / nd * 18 * g.scale;
			hurtPlayer(g, dmg);
			if (g.mode !== "play") return;
		}
	}
	updateFx(g, dt);
	maybeAdvance(g);
}
function tickSpawns(g, dt) {
	if (g.intro > 0 || g.qIndex >= g.queue.length) return;
	let alive = 0;
	for (const e of g.enemies) if (e.alive) alive += 1;
	if (alive >= 12) return;
	const next = (spawnClock.get(g) ?? 0) - dt;
	if (next > 0) {
		spawnClock.set(g, next);
		return;
	}
	const kind = g.queue[g.qIndex];
	if (!kind) return;
	g.qIndex += 1;
	spawnEnemy(g, kind);
	const wait = Math.max(.26, .68 - g.wave * .028) * (.82 + Math.random() * .36);
	spawnClock.set(g, wait);
}
function setQaKeys(g, codes) {
	g.qa = new Set(codes);
	g.pointer.qa = false;
}
function setQaPointer(g, x, y, active) {
	g.qa = null;
	g.pointer.qa = true;
	g.pointer.x = x;
	g.pointer.y = y;
	g.pointer.active = active;
}
function pointFromUser(g, x, y, active) {
	if (g.qa || g.pointer.qa) return;
	g.pointer.x = x;
	g.pointer.y = y;
	g.pointer.active = active;
}
var STEP = 1 / 60;
function loadSprite(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(src));
		img.src = src;
	});
}
function formatScore(n) {
	return Math.round(n).toLocaleString("zh-CN");
}
function Board({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "还没有纪录。打完一局就会留在这台设备上。"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex flex-col gap-1.5",
		children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-baseline gap-3 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-5 font-display text-primary",
					children: index + 1
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular flex-1 font-display text-base text-fg",
					children: formatScore(row.score)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: [
						"第 ",
						row.wave,
						" 波"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: new Date(row.at).toLocaleDateString("zh-CN", {
						month: "numeric",
						day: "numeric"
					})
				})
			]
		}, `${row.at}-${index}`))
	});
}
function GameScreen() {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const spritesRef = (0, import_react.useRef)({
		player: null,
		dart: null,
		orb: null,
		cruiser: null,
		elite: null,
		multi: null,
		shield: null,
		speed: null
	});
	const modeRef = (0, import_react.useRef)("menu");
	const [mode, setMode] = (0, import_react.useState)("menu");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [rank, setRank] = (0, import_react.useState)(null);
	const [finalScore, setFinalScore] = (0, import_react.useState)(0);
	const [finalWave, setFinalWave] = (0, import_react.useState)(1);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [best, setBest] = (0, import_react.useState)(0);
	const scoreRef = (0, import_react.useRef)(null);
	const waveRef = (0, import_react.useRef)(null);
	const comboRef = (0, import_react.useRef)(null);
	const bestRef = (0, import_react.useRef)(null);
	const hpTextRef = (0, import_react.useRef)(null);
	const hpFillRef = (0, import_react.useRef)(null);
	const multiRef = (0, import_react.useRef)(null);
	const shieldRef = (0, import_react.useRef)(null);
	const speedRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const saved = loadScores();
		setRows(saved);
		setBest(saved[0]?.score ?? 0);
		setMuted(loadMute());
	}, []);
	(0, import_react.useEffect)(() => {
		let dead = false;
		const pairs = [
			["player", player_default],
			["dart", dart_default],
			["orb", orb_default],
			["cruiser", cruiser_default],
			["multi", multi_default],
			["shield", shield_default],
			["speed", speed_default]
		];
		Promise.all(pairs.map(async ([key, url]) => [key, await loadSprite(url)])).then((loaded) => {
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
	(0, import_react.useEffect)(() => {
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
		const localPoint = (event) => {
			const rect = canvas.getBoundingClientRect();
			return {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
		};
		const onPointerMove = (event) => {
			const point = localPoint(event);
			const active = event.pointerType === "mouse" ? true : (event.buttons & 1) === 1;
			pointFromUser(g, point.x, point.y, active);
		};
		const onPointerDown = (event) => {
			if (event.pointerType !== "mouse") canvas.setPointerCapture(event.pointerId);
			const point = localPoint(event);
			pointFromUser(g, point.x, point.y, true);
		};
		const onPointerUp = (event) => {
			const point = localPoint(event);
			pointFromUser(g, point.x, point.y, event.pointerType === "mouse");
		};
		const onPointerLeave = (event) => {
			if (event.pointerType === "mouse") pointFromUser(g, g.pointer.x, g.pointer.y, false);
		};
		const onKeyDown = (event) => {
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
		const onKeyUp = (event) => {
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
			setKeys: (codes) => setQaKeys(g, codes),
			setPointer: (x, y, active) => setQaPointer(g, x, y, active),
			getMode: () => g.mode,
			getHp: () => g.player.hp,
			getScore: () => g.score,
			getWave: () => g.wave,
			enemyCount: () => g.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0),
			bulletCount: () => g.bullets.reduce((n, b) => n + (b.alive && b.friendly ? 1 : 0), 0)
		};
		let last = performance.now();
		let acc = 0;
		let raf = 0;
		const overLatch = { current: false };
		const paintHud = () => {
			if (scoreRef.current) scoreRef.current.textContent = formatScore(g.score);
			if (waveRef.current) waveRef.current.textContent = `第 ${g.wave} 波`;
			if (comboRef.current) comboRef.current.textContent = g.combo >= 2 ? `${g.combo} 连击` : "";
			if (bestRef.current) bestRef.current.textContent = formatScore(Math.max(bestRefLive(), g.score));
			const pct = Math.max(0, Math.min(100, g.player.hp / g.player.maxHp * 100));
			if (hpFillRef.current) {
				hpFillRef.current.style.width = `${pct}%`;
				hpFillRef.current.style.background = g.player.shieldT > 0 ? "var(--color-ice)" : "var(--color-danger)";
			}
			if (hpTextRef.current) hpTextRef.current.textContent = `${Math.ceil(g.player.hp)}`;
			const chip = (el, seconds, label) => {
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
		const frame = (now) => {
			const raw = Math.min(.1, (now - last) / 1e3);
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
			const names = drainSfx(g);
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
	(0, import_react.useEffect)(() => {
		if (bestRef.current) bestRef.current.dataset.best = String(best);
	}, [best]);
	const unlockAnd = (fn) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		ref: wrapRef,
		className: "game-root relative h-dvh w-full select-none overflow-hidden bg-bg text-fg",
		style: { touchAction: "none" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full",
				"aria-label": "赤曜战斗画面"
			}),
			mode === "play" || mode === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 z-10 flex flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "hud-safe-top flex items-start justify-between gap-3 px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xs tracking-widest text-primary",
								children: "CHIYAO"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								ref: waveRef,
								className: "text-lg font-semibold",
								children: "第 1 波"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									ref: scoreRef,
									className: "tabular font-display text-3xl leading-none sm:text-4xl",
									children: "0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									ref: comboRef,
									className: "mt-1 h-5 text-sm text-primary"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden text-right sm:block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "最高"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										ref: bestRef,
										"data-best": best,
										className: "tabular font-display text-sm",
										children: formatScore(best)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": mode === "pause" ? "继续" : "暂停",
									onClick: onPause,
									className: "grid size-11 place-items-center rounded-full border border-border bg-bg-raised/85 text-fg",
									children: mode === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
						className: "hud-safe-bottom px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-52 max-w-[58%]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1 flex items-center justify-between text-xs text-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "生命" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											ref: hpTextRef,
											className: "tabular text-fg",
											children: "100"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2 overflow-hidden rounded-full bg-surface",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											ref: hpFillRef,
											className: "h-full w-full bg-danger"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 hidden text-xs text-muted md:block",
										children: "WASD 或指针移动 · 自动瞄准射击 · Esc 暂停"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap justify-end gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										ref: multiRef,
										style: { display: "none" },
										className: "items-center gap-1 rounded-full border border-border bg-bg-raised/80 px-2.5 py-1 text-xs text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, {
											className: "size-3.5",
											"aria-hidden": true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-label": true,
											children: "三重"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										ref: shieldRef,
										style: { display: "none" },
										className: "items-center gap-1 rounded-full border border-border bg-bg-raised/80 px-2.5 py-1 text-xs text-ice",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
											className: "size-3.5",
											"aria-hidden": true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-label": true,
											children: "护盾"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										ref: speedRef,
										style: { display: "none" },
										className: "items-center gap-1 rounded-full border border-border bg-bg-raised/80 px-2.5 py-1 text-xs text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
											className: "size-3.5",
											"aria-hidden": true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-label": true,
											children: "加速"
										})]
									})
								]
							})]
						})
					})
				]
			}) : null,
			mode === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 overflow-y-auto px-4 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overlay-in menu-safe-top mx-auto flex w-full max-w-md flex-col gap-6 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xs tracking-widest text-primary",
								children: "CHIYAO"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 text-5xl font-semibold tracking-wide",
								children: "赤曜"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-base text-muted",
								children: "俯视深空。撑过一波又一波，把火力、护盾和速度抢到手。"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onStart,
							className: "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								className: "size-5",
								"aria-hidden": true
							}), "开始出击"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "grid gap-3 rounded-lg border border-border bg-bg-raised/85 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-semibold text-fg",
									children: "操作"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-start gap-3 text-sm text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {
										className: "mt-0.5 size-4 shrink-0 text-primary",
										"aria-hidden": true
									}), "WASD 或方向键移动。斜向不会更快。键盘优先于指针。"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-start gap-3 text-sm text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pointer, {
										className: "mt-0.5 size-4 shrink-0 text-ice",
										"aria-hidden": true
									}), "桌面把光标放进战场，飞船会平滑跟上。触屏按住拖动。"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-start gap-3 text-sm text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, {
										className: "mt-0.5 size-4 shrink-0 text-danger",
										"aria-hidden": true
									}), "自动朝最近的敌人射击。拾取三重／五重射击、护盾和加速。"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-lg border border-border bg-bg-raised/85 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mb-3 flex items-center gap-2 text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {
									className: "size-4 text-primary",
									"aria-hidden": true
								}), "最高分榜"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, { rows })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onToggleMute,
							className: "inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface px-4 text-sm",
							children: [muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), muted ? "音效已关" : "音效开着"]
						})
					]
				})
			}) : null,
			mode === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 grid place-items-center bg-bg/70 px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overlay-in w-full max-w-sm rounded-lg border border-border bg-bg-raised p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xs tracking-widest text-primary",
							children: "PAUSED"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-3xl font-semibold",
							children: "暂停"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: onPause,
									className: "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-ink",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5" }), "继续"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										const g = gameRef.current;
										if (g) unlockAnd(() => startRun(g));
									},
									className: "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5" }), "重新开始"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: onToggleMute,
									className: "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface font-medium",
									children: [muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" }), muted ? "打开音效" : "关闭音效"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										const g = gameRef.current;
										if (g) goMenu(g);
									},
									className: "inline-flex h-12 items-center justify-center rounded-lg text-sm text-muted",
									children: "返回标题"
								})
							]
						})
					]
				})
			}) : null,
			mode === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 overflow-y-auto bg-bg/75 px-4 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overlay-in mx-auto flex w-full max-w-md flex-col gap-5 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xs tracking-widest text-danger",
								children: "SIGNAL LOST"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-4xl font-semibold",
								children: "舰体损毁"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-muted",
								children: [
									"抵达第 ",
									finalWave,
									" 波"
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tabular font-display text-5xl text-primary",
							children: formatScore(finalScore)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: rank ? `写入最高分榜第 ${rank} 名` : "这次没挤进前八，再冲一次。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onStart,
								className: "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-ink",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5" }), "再来一局"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									const g = gameRef.current;
									if (g) goMenu(g);
								},
								className: "inline-flex h-12 flex-1 items-center justify-center rounded-lg border border-border bg-surface font-medium",
								children: "返回标题"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-lg border border-border bg-bg-raised/90 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "mb-3 flex items-center gap-2 text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {
									className: "size-4 text-primary",
									"aria-hidden": true
								}), "最高分榜"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, { rows })]
						})
					]
				})
			}) : null
		]
	});
}
var SplitComponent = GameScreen;
//#endregion
export { SplitComponent as component };
