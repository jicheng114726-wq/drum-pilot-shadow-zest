import { createFileRoute } from "@tanstack/react-router";
import { GameScreen } from "@/game/GameScreen";
import "@fontsource/orbitron/700.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";

export const Route = createFileRoute("/")({ component: GameScreen });
