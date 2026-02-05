"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { PulsingBorder, ColorPanels } from "@paper-design/shaders-react";
import Lottie from "lottie-react";
import logoAnimationWhite from "../../../public/animations/logo-animation-white.json";
import { Slider } from "@base-ui-components/react/slider";
import { Menu } from "@base-ui-components/react/menu";
import { ShimmerText } from "@/components/shimmer-text";
import { Button } from "@/components/button";
import { CollapseIcon } from "@/components/icons";
import {
	useRive,
	useViewModel,
	useViewModelInstance,
	useViewModelInstanceNumber,
	useViewModelInstanceTrigger,
} from "@rive-app/react-webgl2";
import { VIBE_CHECK_RIVE_SRC, VIBE_CHECK_RIVE_CONFIG, VIBE_CHECK_LAYOUTS } from "@/lib/rive/vibeCheckConfig";

const ANIMATION = {
	duration: 0.7,
	blurAmount: 6,
	staggerDelay: 0.04,
	easing: [0.42, 0, 0.58, 1] as const,
};

const GENERATED_URL = "inflight.co/v/a8f3k2m9";
const GENERATED_URL_V2 = "inflight.co/v/b9g4l3n0";

const CODE_LINES = [
	{ text: "Write(index.html)", color: "text-blue-400" },
	{ text: "  Wrote 156 lines to index.html", color: "text-neutral-500" },
	{ text: '  <!DOCTYPE html>', color: "text-orange-400" },
	{ text: '  <html lang="en" class="dark">', color: "text-orange-400" },
	{ text: "  <head>", color: "text-orange-400" },
	{ text: '    <meta charset="UTF-8">', color: "text-neutral-400" },
	{ text: '    <meta name="viewport" content="width=device-width, initial-scale=1.0">', color: "text-neutral-400" },
	{ text: '    <script src="https://cdn.tailwindcss.com"></script>', color: "text-neutral-400" },
	{ text: "  </head>", color: "text-orange-400" },
	{ text: '  <body class="min-h-screen bg-neutral-950 text-white">', color: "text-orange-400" },
	{ text: '    <main class="container mx-auto px-6 py-24">', color: "text-green-400" },
	{ text: "  ...", color: "text-neutral-600" },
	{ text: "  +145 lines (ctrl+r to expand)", color: "text-neutral-600", isCollapsed: true },
	{ text: "", color: "" },
	{ text: '\u2713 Wrote index.html', color: "text-green-400" },
	{ text: "", color: "" },
];

const TERMINAL_STEPS = [
	{ text: "", delay: 400 },
	{ text: "Connecting to Inflight...", delay: 500, color: "text-yellow-400" },
	{ text: "\u2713 Connected", delay: 600, color: "text-green-400" },
	{ text: "", delay: 200 },
	{ text: "Starting sandbox...", delay: 400, color: "text-neutral-400" },
	{ text: "Building preview...", delay: 600, color: "text-neutral-400" },
	{ text: "Deploying to edge...", delay: 500, color: "text-neutral-400" },
	{ text: "", delay: 200 },
	{ text: `\u2713 Live at https://${GENERATED_URL}`, delay: 800, isLink: true, color: "text-green-400" },
];

const V2_CODE_LINES = [
	{ text: "", color: "" },
	{ text: "Edit(index.html)", color: "text-blue-400" },
	{ text: "  Updating headline...", color: "text-neutral-500" },
	{ text: '  - <h1 class="text-5xl font-bold">/share your work</h1>', color: "text-red-400" },
	{ text: '  + <h1 class="text-5xl font-bold">Sharing work made easy</h1>', color: "text-green-400" },
	{ text: "", color: "" },
	{ text: "\u2713 Updated index.html", color: "text-green-400" },
	{ text: "", color: "" },
];

const V2_TERMINAL_STEPS = [
	{ text: "", delay: 400 },
	{ text: "Syncing changes...", delay: 500, color: "text-yellow-400" },
	{ text: "Building preview...", delay: 600, color: "text-neutral-400" },
	{ text: "Deploying update...", delay: 500, color: "text-neutral-400" },
	{ text: "", delay: 200 },
	{ text: `\u2713 Live at https://${GENERATED_URL_V2}`, delay: 800, isLink: true, isV2: true, color: "text-green-400" },
];

function TerminalWindow({
	onComplete,
	onV2Complete,
	isRunning,
	onRun,
	isV2Running,
	onV2Run,
	isFullscreen,
	onScrollToPreview,
}: {
	onComplete: () => void;
	onV2Complete: () => void;
	isRunning: boolean;
	onRun: () => void;
	isV2Running: boolean;
	onV2Run: () => void;
	isFullscreen?: boolean;
	onScrollToPreview?: () => void;
}) {
	const [codeLines, setCodeLines] = useState<typeof CODE_LINES>([]);
	const [terminalLines, setTerminalLines] = useState<typeof TERMINAL_STEPS>([]);
	const [v2CodeLines, setV2CodeLines] = useState<typeof V2_CODE_LINES>([]);
	const [v2TerminalLines, setV2TerminalLines] = useState<typeof V2_TERMINAL_STEPS>([]);
	const [showCursor, setShowCursor] = useState(true);
	const [isComplete, setIsComplete] = useState(false);
	const [isV2Complete, setIsV2Complete] = useState(false);
	const [codeComplete, setCodeComplete] = useState(false);
	const [v2CodeComplete, setV2CodeComplete] = useState(false);
	const [showV2Prompt, setShowV2Prompt] = useState(false);
	const terminalRef = useRef<HTMLDivElement>(null);
	const codeAnimationStartedRef = useRef(false);
	const phase1StartedRef = useRef(false);
	const phase2StartedRef = useRef(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setShowCursor((prev) => !prev);
		}, 530);
		return () => clearInterval(interval);
	}, []);

	// Auto-scroll helper
	const scrollToBottom = useCallback(() => {
		if (terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}
	}, []);

	// Auto-scroll when content changes
	useEffect(() => {
		scrollToBottom();
	}, [codeLines, terminalLines, v2CodeLines, v2TerminalLines, showV2Prompt, codeComplete, v2CodeComplete, scrollToBottom]);

	// Animate code lines on mount
	useEffect(() => {
		if (codeAnimationStartedRef.current) return;
		codeAnimationStartedRef.current = true;

		let lineIndex = 0;
		const interval = setInterval(() => {
			if (lineIndex < CODE_LINES.length) {
				setCodeLines((prev) => [...prev, CODE_LINES[lineIndex]]);
				lineIndex++;
			} else {
				clearInterval(interval);
				setCodeComplete(true);
			}
		}, 60);

		return () => clearInterval(interval);
	}, []);

	// Phase 1: Run /share
	useEffect(() => {
		if (!isRunning || phase1StartedRef.current) return;
		phase1StartedRef.current = true;

		const timeoutIds: ReturnType<typeof setTimeout>[] = [];
		let intervalId: ReturnType<typeof setInterval> | null = null;
		let totalDelay = 0;

		TERMINAL_STEPS.forEach((step, index) => {
			totalDelay += step.delay;
			const isLastStep = index === TERMINAL_STEPS.length - 1;

			const timeoutId = setTimeout(() => {
				setTerminalLines((prev) => [...prev, step]);
				if (isLastStep) {
					setIsComplete(true);
					onComplete();
					// Start V2 code animation after 1.5 seconds
					const v2TimeoutId = setTimeout(() => {
						let v2LineIndex = 0;
						intervalId = setInterval(() => {
							if (v2LineIndex < V2_CODE_LINES.length) {
								setV2CodeLines((prev) => [...prev, V2_CODE_LINES[v2LineIndex]]);
								v2LineIndex++;
							} else {
								if (intervalId) clearInterval(intervalId);
								setV2CodeComplete(true);
								setShowV2Prompt(true);
							}
						}, 60);
					}, 1500);
					timeoutIds.push(v2TimeoutId);
				}
			}, totalDelay);
			timeoutIds.push(timeoutId);
		});

		return () => {
			timeoutIds.forEach((id) => clearTimeout(id));
			if (intervalId) clearInterval(intervalId);
		};
	}, [isRunning, onComplete]);

	// Phase 2: Run V2 update
	useEffect(() => {
		if (!isV2Running || phase2StartedRef.current) return;
		phase2StartedRef.current = true;

		const timeoutIds: ReturnType<typeof setTimeout>[] = [];
		setShowV2Prompt(false);
		let totalDelay = 0;

		V2_TERMINAL_STEPS.forEach((step, index) => {
			totalDelay += step.delay;
			const isLastStep = index === V2_TERMINAL_STEPS.length - 1;

			const timeoutId = setTimeout(() => {
				setV2TerminalLines((prev) => [...prev, step]);
				if (isLastStep) {
					setIsV2Complete(true);
					onV2Complete();
				}
			}, totalDelay);
			timeoutIds.push(timeoutId);
		});

		return () => {
			timeoutIds.forEach((id) => clearTimeout(id));
		};
	}, [isV2Running, onV2Complete]);

	// Keyboard handler
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			// Don't trigger terminal actions when fullscreen preview is open
			if (isFullscreen) return;

			// Don't trigger terminal actions when focused on an input
			const activeElement = document.activeElement;
			if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
				return;
			}

			if (e.key === "Enter") {
				if (!isRunning && !isComplete && codeComplete) {
					onRun();
					onScrollToPreview?.();
				} else if (showV2Prompt && !isV2Running && !isV2Complete) {
					onV2Run();
					onScrollToPreview?.();
				}
			}
		},
		[isRunning, isComplete, codeComplete, showV2Prompt, isV2Running, isV2Complete, onRun, onV2Run, isFullscreen, onScrollToPreview]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
			{/* Terminal header */}
			<div className="bg-neutral-800 px-4 h-[52px] flex-shrink-0 flex items-center gap-2">
				<div className="flex gap-2">
					<div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
					<div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
					<div className="w-3 h-3 rounded-full bg-[#27CA40]" />
				</div>
				<div className="flex-1 text-center text-neutral-400 text-sm font-mono">
					Claude — Terminal
				</div>
				<div className="w-14" />
			</div>

			{/* Terminal body */}
			<div
				ref={terminalRef}
				className="bg-[#0d1117] p-4 font-mono text-sm flex-1 min-h-0 overflow-y-hidden flex flex-col"
			>
				<div className="mt-auto">
				{/* Initial code output */}
				{codeLines.map((line, i) => (
					<div key={`code-${i}`} className={`${line?.color || "text-neutral-400"} leading-relaxed`}>
						{line?.isCollapsed ? (
							<span className="italic">{line?.text}</span>
						) : (
							line?.text || "\u00A0"
						)}
					</div>
				))}

				{/* Command prompt after code */}
				{codeComplete && terminalLines.length === 0 && (
					<div className="flex items-center text-neutral-300 mt-2">
						<span className="text-white">/share</span>
						{!isRunning && !isComplete && (
							<span
								className={`ml-1 w-2 h-5 bg-white inline-block ${
									showCursor ? "opacity-100" : "opacity-0"
								}`}
							/>
						)}
					</div>
				)}

				{/* Phase 1 terminal output lines */}
				{terminalLines.map((line, i) => (
					<div key={`term-${i}`} className="leading-relaxed">
						{line?.isLink ? (
							<span className={line.color || "text-green-400"}>
								{line.text?.split("https://")[0]}
								<a
									href={`https://${GENERATED_URL}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									https://{GENERATED_URL}
								</a>
							</span>
						) : (
							<span className={line?.color || "text-neutral-400"}>{line?.text || "\u00A0"}</span>
						)}
					</div>
				))}

				{/* Press Enter prompt for Phase 1 */}
				{codeComplete && !isRunning && !isComplete && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-6 flex items-center justify-center gap-3"
					>
						<span className="text-neutral-500 text-xs">press</span>
						<Button
							onClick={onRun}
							variant="secondary"
							size="sm"
							rightIcon={<span className="text-neutral-400">↵</span>}
						>
							<ShimmerText color="#B9BEC7" duration={3} width={40}>enter</ShimmerText>
						</Button>
						<span className="text-neutral-500 text-xs">to share</span>
					</motion.div>
				)}

				{/* V2 code output */}
				{v2CodeLines.map((line, i) => (
					<div key={`v2code-${i}`} className={`${line?.color || "text-neutral-400"} leading-relaxed`}>
						{line?.text || "\u00A0"}
					</div>
				))}

				{/* V2 command prompt */}
				{v2CodeComplete && v2TerminalLines.length === 0 && (
					<div className="flex items-center text-neutral-300 mt-2">
						<span className="text-white">Update Inflight to V2</span>
						{showV2Prompt && !isV2Running && !isV2Complete && (
							<span
								className={`ml-1 w-2 h-5 bg-white inline-block ${
									showCursor ? "opacity-100" : "opacity-0"
								}`}
							/>
						)}
					</div>
				)}

				{/* V2 terminal output lines */}
				{v2TerminalLines.map((line, i) => (
					<div key={`v2term-${i}`} className="leading-relaxed">
						{(line as any)?.isLink ? (
							<span className={line.color || "text-green-400"}>
								{line.text?.split("https://")[0]}
								<a
									href={`https://${GENERATED_URL_V2}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									https://{GENERATED_URL_V2}
								</a>
							</span>
						) : (
							<span className={line?.color || "text-neutral-400"}>{line?.text || "\u00A0"}</span>
						)}
					</div>
				))}

				{/* Press Enter prompt for V2 */}
				{showV2Prompt && !isV2Running && !isV2Complete && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-6 flex items-center justify-center gap-3"
					>
						<span className="text-neutral-500 text-xs">press</span>
						<Button
							onClick={onV2Run}
							variant="secondary"
							size="sm"
							rightIcon={<span className="text-neutral-400">↵</span>}
						>
							<ShimmerText color="#B9BEC7" duration={3} width={40}>enter</ShimmerText>
						</Button>
						<span className="text-neutral-500 text-xs">to update</span>
					</motion.div>
				)}
				</div>
			</div>
		</div>
	);
}

function DemoVibeCheckSlider() {
	const [localValue, setLocalValue] = useState(4);
	const [isDragging, setIsDragging] = useState(false);
	const [thumbScope, animate] = useAnimate();

	// Tick sound
	const tickSoundRef = useRef<HTMLAudioElement | null>(null);
	const lastTickPositionRef = useRef<number>(4);

	useEffect(() => {
		const tickSound = new Audio("/sounds/countdown-tick.wav");
		tickSound.preload = "auto";
		tickSoundRef.current = tickSound;
		return () => { tickSoundRef.current = null; };
	}, []);

	const playTickSound = useCallback(() => {
		const audio = tickSoundRef.current;
		if (!audio) return;
		audio.currentTime = 0;
		void audio.play().catch(() => {});
	}, []);

	// Idle animation
	useEffect(() => {
		if (isDragging || !thumbScope.current) return;
		const element = thumbScope.current;
		const controls = animate(
			element,
			{ x: [8, -8] },
			{ duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
		);
		return () => {
			controls.stop();
			if (element) animate(element, { x: 0 }, { duration: 0.2 });
		};
	}, [isDragging, animate, thumbScope]);

	// Rive setup
	const riveConfig = useMemo(() => ({
		src: VIBE_CHECK_RIVE_SRC,
		...VIBE_CHECK_RIVE_CONFIG,
		layout: VIBE_CHECK_LAYOUTS.contain,
	}), []);

	const { rive, RiveComponent } = useRive(riveConfig);
	const viewModel = useViewModel(rive, { name: "main" });
	const viewModelInstance = useViewModelInstance(viewModel, { rive });
	const { setValue: setAvatarPosition } = useViewModelInstanceNumber("avatarPosition", viewModelInstance);
	const { trigger: triggerDragging } = useViewModelInstanceTrigger("dragging", viewModelInstance);
	const { trigger: triggerDraggFinished } = useViewModelInstanceTrigger("draggFinished", viewModelInstance);

	const handleValueChange = (value: number | number[]) => {
		const newValue = Array.isArray(value) ? value[0] : value;
		setLocalValue(newValue);
		const percentage = (newValue / 7) * 320 - 160;
		setAvatarPosition(percentage);

		const currentTick = Math.round(newValue);
		const lastTick = lastTickPositionRef.current;
		if (currentTick !== lastTick) {
			const ticksCrossed = Math.abs(currentTick - lastTick);
			for (let i = 0; i < ticksCrossed; i++) {
				if (i === 0) playTickSound();
				else setTimeout(() => playTickSound(), i * 30);
			}
			lastTickPositionRef.current = currentTick;
		}
	};

	const handleValueCommit = (value: number | number[]) => {
		const newValue = Array.isArray(value) ? value[0] : value;
		const roundedValue = Math.round(newValue);
		setLocalValue(roundedValue);
		const percentage = (roundedValue / 7) * 320 - 160;
		setAvatarPosition(percentage);
	};

	return (
		<div className="relative mt-0">
			{/* Rive animation background */}
			<div className="absolute inset-0 pointer-events-none flex items-center" style={{ margin: "0 -10px" }}>
				<RiveComponent style={{ width: "100%", height: "60px" }} />
			</div>

			{/* Base UI Slider */}
			<div className="relative z-10 px-2 flex items-center" style={{ minHeight: "40px" }}>
				<Slider.Root
					value={[localValue]}
					onValueChange={handleValueChange}
					onValueCommitted={handleValueCommit}
					min={1}
					max={7}
					step={0.01}
					className="w-full"
				>
					<Slider.Control className="flex w-full touch-none items-center select-none">
						<Slider.Track className="h-1 w-full rounded bg-transparent select-none">
							<Slider.Indicator className="rounded bg-transparent select-none" />
							<Slider.Thumb
								ref={thumbScope}
								className="relative size-8 rounded-full shadow-lg select-none hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing"
								onPointerDown={() => { setIsDragging(true); triggerDragging(); }}
								onPointerUp={() => { setIsDragging(false); triggerDraggFinished(); }}
							>
								{/* Gradient border */}
								<div
									className="absolute inset-0 rounded-full pointer-events-none"
									style={{
										background: "linear-gradient(to right, rgba(56,189,248,0.5), rgba(167,139,250,0.5), rgba(244,114,182,0.5), rgba(251,146,60,0.5))",
										backgroundSize: "600% 100%",
										backgroundPosition: `${((localValue - 1) / 6) * 100}% 0%`,
										filter: "blur(1px)",
									}}
								/>
								<div className="absolute inset-[2px] rounded-full bg-neutral-900/80 backdrop-blur-[2px] pointer-events-none" />
								{/* Avatar */}
								<img
									src="/images/ridd-avatar.jpg"
									alt=""
									draggable={false}
									className="absolute inset-[2px] rounded-full object-cover w-[calc(100%-4px)] h-[calc(100%-4px)] pointer-events-none"
								/>
							</Slider.Thumb>
						</Slider.Track>
					</Slider.Control>
				</Slider.Root>
			</div>
		</div>
	);
}

function DemoPollReviewer() {
	const [selected, setSelected] = useState<number | null>(null);
	const options = ["Dark Mode", "Light Mode"];

	return (
		<div className="flex flex-col gap-0 w-full mt-2">
			{options.map((label, index) => {
				const isSelected = selected === index;
				return (
					<div
						key={index}
						onClick={() => setSelected(index)}
						className={`group/option flex flex-row items-center gap-2 h-8 -mx-2 px-2 rounded-[8px] transition-colors select-none cursor-pointer ${
							isSelected ? "bg-[rgba(28,138,248,0.08)]" : "hover:bg-white/5"
						}`}
					>
						<div className="w-4 h-4 flex-shrink-0 relative">
							{isSelected ? (
								<img
									src="/images/ridd-avatar.jpg"
									alt=""
									className="w-4 h-4 rounded-full object-cover"
								/>
							) : (
								<div className={`w-4 h-4 rounded-full border-[1.6px] border-white/15 transition-opacity ${
									"opacity-100 group-hover/option:opacity-0"
								}`} />
							)}
							{!isSelected && (
								<img
									src="/images/ridd-avatar.jpg"
									alt=""
									className="w-4 h-4 rounded-full object-cover absolute inset-0 opacity-0 group-hover/option:opacity-100 transition-opacity"
								/>
							)}
						</div>
						<span
							className={`text-[12px] transition-colors ${
								isSelected ? "text-white" : "text-neutral-300 group-hover/option:text-white"
							}`}
						>
							{label}
						</span>
					</div>
				);
			})}
		</div>
	);
}

function DemoFeedbackBar() {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div className="relative group/feedback w-full mt-2">
			{/* Matches FeedbackBar production styling - recording/video mode */}
			<div
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className="flex flex-1 pl-3 pr-2 py-2 min-h-10 flex-row items-center gap-3 rounded-[12px] overflow-hidden transition-all duration-300 ease-in-out cursor-pointer border border-white/10 hover:border-[rgba(255,32,86,0.50)] ring-[2px] ring-transparent hover:ring-[rgba(255,32,86,0.20)]"
				style={{
					boxShadow: "0 1px 1px -0.5px rgba(0,0,0,0.16), 0 3px 3px -1.5px rgba(0,0,0,0.16), 0 6px 6px -3px rgba(0,0,0,0.16), 0 12px 12px -6px rgba(0,0,0,0.16), 0 24px 24px -12px rgba(0,0,0,0.16)",
					background: isHovered
						? "linear-gradient(0deg, rgba(255, 32, 86, 0.05) 0%, rgba(255, 32, 86, 0.05) 100%), rgba(0, 0, 0, 0.6)"
						: undefined,
				}}
			>
				{/* Record icon */}
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
					<path
						opacity="0.6"
						d="M14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14V15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15V14C11.3137 14 14 11.3137 14 8Z"
						fill="#FF2056"
					/>
					<path
						d="M11 8C11 9.65685 9.65685 11 8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8Z"
						fill="#FF2056"
					/>
				</svg>
				<span className={`text-[12px] flex-1 select-none transition-colors ${isHovered ? "text-white" : "text-white/60"}`}>
					Record
				</span>
				{/* Video mode pill */}
				<div className="flex items-center justify-center gap-0 h-6 px-1.5 rounded-[6px] ring-[0.5px] ring-white/10 bg-white/[0.03] select-none text-white">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M9.90039 5C9.90039 4.76131 9.8055 4.53206 9.63672 4.36328C9.48902 4.21558 9.29493 4.12493 9.08887 4.10449L9 4.09961H3C2.76131 4.09961 2.53206 4.1945 2.36328 4.36328C2.1945 4.53206 2.09961 4.76131 2.09961 5V11L2.10449 11.0889C2.12493 11.2949 2.21558 11.489 2.36328 11.6367C2.53206 11.8055 2.76131 11.9004 3 11.9004H9L9.08887 11.8955C9.29493 11.8751 9.48902 11.7844 9.63672 11.6367C9.8055 11.4679 9.90039 11.2387 9.90039 11V5ZM11.0996 7.24805V8.75098L13.9004 11.5518V4.44727L11.0996 7.24805ZM11.0996 5.55176L13.2227 3.42871L13.3457 3.32324C13.4757 3.22701 13.6262 3.1597 13.7861 3.12793L13.9463 3.1084C14.054 3.10313 14.162 3.11352 14.2666 3.13965L14.4209 3.19043L14.5654 3.26367C14.658 3.31915 14.7419 3.38788 14.8145 3.46777L14.9141 3.5957L14.9941 3.73633C15.0634 3.88257 15.0995 4.04292 15.0996 4.20605V11.7939C15.0994 12.0113 15.0349 12.2236 14.9141 12.4043C14.7932 12.585 14.6218 12.7264 14.4209 12.8096C14.2202 12.8927 13.9992 12.9143 13.7861 12.8721C13.6262 12.8403 13.4757 12.773 13.3457 12.6768L13.2227 12.5713L11.0996 10.4473V11C11.0996 11.557 10.8792 12.0915 10.4854 12.4854C10.1409 12.8298 9.68859 13.042 9.20801 13.0898L9 13.0996H3C2.44305 13.0996 1.90847 12.8792 1.51465 12.4854C1.17015 12.1409 0.957974 11.6886 0.910156 11.208L0.900391 11V5C0.900391 4.44305 1.12082 3.90847 1.51465 3.51465C1.90847 3.12082 2.44305 2.90039 3 2.90039H9L9.20801 2.91016C9.68859 2.95797 10.1409 3.17015 10.4854 3.51465C10.8792 3.90847 11.0996 4.44305 11.0996 5V5.55176Z"
							fill="currentColor"
						/>
					</svg>
					<span className="px-1 text-[12px] font-medium leading-[1.2]">Video</span>
				</div>
			</div>
		</div>
	);
}

function DemoFeedbackDivider() {
	return (
		<div className="flex flex-col w-full">
			<div className="h-[1px] bg-neutral-950" />
			<div className="h-[1px] bg-neutral-600 opacity-50" />
		</div>
	);
}

function UnicornBackground() {
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<any>(null);

	useEffect(() => {
		let destroyed = false;

		const init = async () => {
			// Load UnicornStudio via script tag (UMD doesn't work with dynamic import)
			if (!(window as any).UnicornStudio) {
				await new Promise<void>((resolve, reject) => {
					const script = document.createElement("script");
					script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.4/dist/unicornStudio.umd.js";
					script.onload = () => resolve();
					script.onerror = () => reject(new Error("Failed to load UnicornStudio"));
					document.head.appendChild(script);
				});
			}

			if (destroyed || !containerRef.current) return;

			const scene = await (window as any).UnicornStudio.addScene({
				element: containerRef.current,
				filePath: "/unicorn/guilloche-stars.json",
				scale: 1,
				dpi: 1.5,
				fps: 60,
				interactivity: {
					mouse: {
						disabled: false,
					},
				},
			});

			if (!destroyed) {
				sceneRef.current = scene;
			}
		};

		init().catch(console.error);

		return () => {
			destroyed = true;
			if (sceneRef.current?.destroy) {
				sceneRef.current.destroy();
			}
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="absolute inset-0 w-full h-full"
			style={{ zIndex: 0 }}
		/>
	);
}

function FeedbackGuide({
	isExpanded,
	skipAnimation,
	isCollapsed,
	onToggleCollapse,
	isMobile,
}: {
	isExpanded?: boolean;
	skipAnimation?: boolean;
	isCollapsed?: boolean;
	onToggleCollapse?: () => void;
	isMobile?: boolean;
}) {
	// On mobile, animate between collapsed button and expanded sidebar
	if (isMobile) {
		return (
			<AnimatePresence mode="wait">
				{isCollapsed ? (
					<motion.div
						key="feedback-button"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
						className="absolute right-2 top-2 z-20"
					>
						<Button
							variant="secondary"
							size="sm"
							onClick={onToggleCollapse}
							shimmer
							shimmerColor="#B9BEC7"
						>
							Feedback
						</Button>
					</motion.div>
				) : (
					<motion.div
						key="feedback-sidebar"
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 40 }}
						transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
						className={`absolute z-20 flex flex-col gap-0 right-1 top-1 bottom-1 transition-[width] duration-300 ${
							isExpanded ? "w-[280px]" : "w-[240px]"
						}`}
					>
						{/* Header */}
						<div className="flex flex-row items-center gap-2 h-[38px] px-4 bg-neutral-800 border-white/5 select-none rounded-t-[6px] border-t border-l border-r">
							<span className="text-[12px] font-medium text-white flex-1">Feedback Guide</span>
							{onToggleCollapse && (
								<button
									onClick={onToggleCollapse}
									className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
								>
									<CollapseIcon />
								</button>
							)}
						</div>

						<DemoFeedbackDivider />

						{/* Content area */}
						<div className="relative flex-1 min-h-0 overflow-y-auto bg-neutral-800 border-white/5 border-l border-r border-b rounded-b-[6px]">
							{/* Question 1 - Vibe Check */}
							<div className="flex flex-col gap-1.5 px-4 py-3 w-full">
								<div className="flex flex-row items-center gap-2 w-full">
									<div className="h-5 flex items-center rounded-[5px] bg-white/5 select-none">
										<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
											<span className="text-[11px] font-medium text-neutral-400">01</span>
										</div>
									</div>
								</div>
								<p className="text-[12px] text-neutral-300">
									How do you feel about this page?
								</p>
								<DemoVibeCheckSlider />
							</div>

							<DemoFeedbackDivider />

							{/* Question 2 - Poll */}
							<div className="flex flex-col gap-1.5 px-4 py-3 w-full">
								<div className="flex flex-row items-center gap-2 w-full">
									<div className="h-5 flex items-center rounded-[5px] bg-white/5 select-none">
										<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
											<span className="text-[11px] font-medium text-neutral-400">02</span>
										</div>
									</div>
								</div>
								<p className="text-[12px] text-neutral-300">
									Which would you prefer?
								</p>
								<DemoPollReviewer />
							</div>

							<DemoFeedbackDivider />

							{/* Question 3 - Open ended text */}
							<div className="flex flex-col gap-1.5 px-4 py-3 w-full">
								<div className="flex flex-row items-center gap-2 w-full">
									<div className="h-5 flex items-center rounded-[5px] bg-white/5 select-none">
										<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
											<span className="text-[11px] font-medium text-neutral-400">03</span>
										</div>
									</div>
								</div>
								<p className="text-[12px] text-neutral-300">
									Do you have any other feedback?
								</p>
								<DemoFeedbackBar />
							</div>

							{/* Bottom gradient fade */}
							<div
								className="sticky bottom-0 left-0 right-0 h-16 pointer-events-none rounded-b-[6px]"
								style={{ background: "linear-gradient(to bottom, transparent, #15161C)" }}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		);
	}

	// Desktop sidebar (always visible, no collapse toggle)
	return (
		<motion.div
			initial={skipAnimation ? false : { opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={skipAnimation ? { duration: 0 } : { delay: 0, duration: 0.4 }}
			className={`absolute z-20 flex flex-col gap-0 right-1 top-1 bottom-1 transition-[width] duration-300 ${
				isExpanded ? "w-[280px]" : "w-[240px]"
			}`}
		>
			{/* Header */}
			<div className="flex flex-row items-center gap-2 h-[38px] px-4 bg-neutral-800 border-white/5 select-none rounded-t-[6px] border-t border-l border-r">
				<span className="text-[12px] font-medium text-white flex-1">Feedback Guide</span>
			</div>

			<DemoFeedbackDivider />

			{/* Content area */}
			<div className="relative flex-1 min-h-0 overflow-y-auto bg-neutral-800 border-white/5 border-l border-r border-b rounded-b-[6px]">
				{/* Question 1 - Vibe Check */}
				<div className="flex flex-col gap-1.5 px-4 py-3 w-full">
					<div className="flex flex-row items-center gap-2 w-full">
						<div className="h-5 flex items-center rounded-[5px] bg-white/5 select-none">
							<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
								<span className="text-[11px] font-medium text-neutral-400">01</span>
							</div>
						</div>
					</div>
					<p className="text-[12px] text-neutral-300">
						How do you feel about this page?
					</p>
					<DemoVibeCheckSlider />
				</div>

				<DemoFeedbackDivider />

				{/* Question 2 - Poll */}
				<div className="flex flex-col gap-1.5 px-4 py-3 w-full">
					<div className="flex flex-row items-center gap-2 w-full">
						<div className="h-5 flex items-center rounded-[5px] bg-white/5 select-none">
							<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
								<span className="text-[11px] font-medium text-neutral-400">02</span>
							</div>
						</div>
					</div>
					<p className="text-[12px] text-neutral-300">
						Which would you prefer?
					</p>
					<DemoPollReviewer />
				</div>

				<DemoFeedbackDivider />

				{/* Question 3 - Open ended text */}
				<div className="flex flex-col gap-1.5 px-4 py-3 w-full">
					<div className="flex flex-row items-center gap-2 w-full">
						<div className="h-5 flex items-center rounded-[5px] bg-white/5 select-none">
							<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
								<span className="text-[11px] font-medium text-neutral-400">03</span>
							</div>
						</div>
					</div>
					<p className="text-[12px] text-neutral-300">
						Do you have any other feedback?
					</p>
					<DemoFeedbackBar />
				</div>

				{/* Bottom gradient fade */}
				<div
					className="sticky bottom-0 left-0 right-0 h-16 pointer-events-none rounded-b-[6px]"
					style={{ background: "linear-gradient(to bottom, transparent, #15161C)" }}
				/>
			</div>
		</motion.div>
	);
}

function VersionDropdown({
	selectedVersion,
	onVersionChange,
}: {
	selectedVersion: 1 | 2;
	onVersionChange: (version: 1 | 2) => void;
}) {
	return (
		<Menu.Root>
			<Menu.Trigger
				className="flex flex-row items-center justify-center gap-1 w-[52px] h-8 rounded-[8px] bg-white/[0.03] text-white text-[14px] font-medium transition-all cursor-pointer shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_1px_-0.5px_rgba(0,0,0,0.16)] hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] hover:bg-white/5 data-[popup-open]:bg-white/5"
			>
				<span>V{selectedVersion}</span>
				<svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-neutral-400">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M4.21967 6.21967C4.51256 5.92678 4.98744 5.92678 5.28033 6.21967L8 8.93934L10.7197 6.21967C11.0126 5.92678 11.4874 5.92678 11.7803 6.21967C12.0732 6.51256 12.0732 6.98744 11.7803 7.28033L8.53033 10.5303C8.23744 10.8232 7.76256 10.8232 7.46967 10.5303L4.21967 7.28033C3.92678 6.98744 3.92678 6.51256 4.21967 6.21967Z"
						fill="currentColor"
					/>
				</svg>
			</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-[60]">
					<Menu.Popup className="flex flex-col gap-1 p-1 min-w-[100px] origin-[var(--transform-origin)] bg-neutral-800 border border-white/10 rounded-[10px] shadow-lg overflow-hidden outline-none transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
						<Menu.Item
							onClick={() => onVersionChange(1)}
							className={`flex items-center gap-2 h-8 px-3 rounded-lg cursor-pointer transition-colors text-[14px] font-medium ${
								selectedVersion === 1
									? "bg-[rgba(28,138,248,0.10)] text-white"
									: "text-neutral-300 hover:bg-white/5 hover:text-white"
							}`}
						>
							V1
						</Menu.Item>
						<Menu.Item
							onClick={() => onVersionChange(2)}
							className={`flex items-center gap-2 h-8 px-3 rounded-lg cursor-pointer transition-colors text-[14px] font-medium ${
								selectedVersion === 2
									? "bg-[rgba(28,138,248,0.10)] text-white"
									: "text-neutral-300 hover:bg-white/5 hover:text-white"
							}`}
						>
							V2
						</Menu.Item>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}

function SharePreview({
	isVisible,
	v2Available,
	displayVersion,
	onVersionChange,
	isFullscreen,
	onToggleFullscreen,
	email,
	onEmailChange,
	onSubmit,
	formStatus,
	errorMessage,
}: {
	isVisible: boolean;
	v2Available: boolean;
	displayVersion: 1 | 2;
	onVersionChange: (version: 1 | 2) => void;
	isFullscreen: boolean;
	onToggleFullscreen: () => void;
	email: string;
	onEmailChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	formStatus: "idle" | "loading" | "success" | "error";
	errorMessage: string;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [isSm, setIsSm] = useState(true);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const hasAnimatedRef = useRef(false);

	useEffect(() => {
		const mql = window.matchMedia("(min-width: 640px)");
		setIsSm(mql.matches);
		const handler = (e: MediaQueryListEvent) => setIsSm(e.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, []);

	const isMobile = !isSm;
	const toggleSidebarCollapse = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, []);

	// On mobile, sidebar overlaps content (marginRight stays 0). On desktop, content shifts left.
	const sidebarMargin = isMobile ? 0 : (isFullscreen ? 280 : 240);

	// Mark as animated after first render
	useEffect(() => {
		if (isVisible && !hasAnimatedRef.current) {
			// Small delay to ensure animation plays on first load
			const timer = setTimeout(() => {
				hasAnimatedRef.current = true;
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isVisible]);

	if (!isVisible) return null;

	// Skip animations if we've already animated once (e.g., collapsing from fullscreen)
	const skipSlideAnimation = hasAnimatedRef.current || isFullscreen;

	const card = (
		<motion.div
			initial={skipSlideAnimation ? false : { opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={skipSlideAnimation ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
			className={`rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 flex flex-col ${
				isFullscreen
					? "fixed inset-4 z-50"
					: "relative w-full h-full"
			}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Fullscreen backdrop */}
			{isFullscreen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="fixed inset-0 bg-black/80 -z-10"
					onClick={onToggleFullscreen}
				/>
			)}

			{/* Expand/collapse button - at container corner, same height as URL bar - hidden on mobile */}
			<AnimatePresence>
				{(isHovered || isFullscreen) && (
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						onClick={onToggleFullscreen}
						className="absolute top-[10px] right-[10px] z-30 h-8 w-8 rounded-[8px] bg-white/[0.03] text-white hidden sm:flex items-center justify-center transition-all shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_1px_-0.5px_rgba(0,0,0,0.16)] hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] hover:bg-white/5"
						title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
					>
						{isFullscreen ? (
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
							</svg>
						) : (
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
							</svg>
						)}
					</motion.button>
				)}
			</AnimatePresence>

			{/* Browser chrome */}
			<div className="bg-neutral-800 px-4 h-[52px] flex-shrink-0 flex items-center gap-2">
				<div className="flex gap-2">
					<div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
					<div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
					<div className="w-3 h-3 rounded-full bg-[#27CA40]" />
				</div>
				{/* Version dropdown - only shown when V2 is available */}
				{v2Available && (
					<VersionDropdown
						selectedVersion={displayVersion}
						onVersionChange={onVersionChange}
					/>
				)}
				<div className="flex-1 flex justify-end sm:justify-center min-w-0">
					<div className="bg-neutral-700 rounded-md px-4 py-1.5 text-neutral-300 text-sm flex items-center gap-2 sm:min-w-[280px] min-w-0">
						<svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<span className="text-neutral-400 truncate">{displayVersion === 2 ? GENERATED_URL_V2 : GENERATED_URL}</span>
					</div>
				</div>
				<div className="w-8 hidden sm:block" />
			</div>

			{/* Share page preview - mimics /share/1 */}
			<div
				className={`relative overflow-hidden transition-all duration-300 flex-1 min-h-0`}
				style={{
					background: "#000000",
				}}
			>
				{/* Shader backgrounds - V1 gets ColorPanels, V2 gets Unicorn */}
				{displayVersion === 2 ? (
					<>
						<UnicornBackground />
						{/* Radial gradient: opaque center fading to transparent edges */}
						<div
							className="absolute inset-0 pointer-events-none"
							style={{
								zIndex: 1,
								background: "radial-gradient(ellipse 50% 50% at 50% 50%, #0F1012 0%, transparent 100%)",
							}}
						/>
					</>
				) : (
					<motion.div
						className="absolute inset-0 pointer-events-none"
						style={{ backgroundColor: "#000000" }}
						initial={skipSlideAnimation ? false : { marginRight: 0 }}
						animate={{ marginRight: sidebarMargin }}
						transition={skipSlideAnimation ? { duration: 0 } : { delay: 0, duration: 0.4 }}
					>
						<ColorPanels
							speed={2}
							scale={2.39}
							density={2.21}
							angle1={-1}
							angle2={-1}
							length={0.52}
							edges={false}
							blur={0.06}
							fadeIn={0}
							fadeOut={1}
							gradient={0}
							rotation={91}
							offsetX={0}
							offsetY={0.6}
							colors={["#0080F033"]}
							colorBack="#00000000"
							style={{ width: "100%", height: "100%" }}
						/>
					</motion.div>
				)}

				{/* Feedback Guide */}
				<FeedbackGuide
					isExpanded={isFullscreen}
					skipAnimation={skipSlideAnimation}
					isCollapsed={isSidebarCollapsed}
					onToggleCollapse={toggleSidebarCollapse}
					isMobile={isMobile}
				/>

				{/* Content - uses marginRight for sidebar */}
				<motion.div
					className={`relative z-10 flex flex-col items-center justify-center h-full ${
						isFullscreen ? "px-12" : "px-6"
					}`}
					initial={skipSlideAnimation ? false : { marginRight: 0 }}
					animate={{ marginRight: sidebarMargin }}
					transition={skipSlideAnimation ? { duration: 0 } : { delay: 0, duration: 0.4 }}
				>
					{/* Hero text */}
					<motion.div
						initial={skipSlideAnimation ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={skipSlideAnimation ? { duration: 0 } : { delay: 0.5, duration: 0.6 }}
						className="text-center"
						key={displayVersion}
					>
						{displayVersion === 1 ? (
							<div>
								<h1 className={`${isFullscreen ? "text-[72px]" : "text-[48px]"} font-medium leading-[1] tracking-[-0.03em] text-white transition-all duration-500`}>
									<span className="italic opacity-90">/</span>share
								</h1>
								<p
									className={`${isFullscreen ? "text-[72px]" : "text-[48px]"} font-medium leading-[1] tracking-[-0.03em] bg-clip-text text-transparent -mt-1 transition-all duration-500`}
									style={{ backgroundImage: "linear-gradient(to bottom, white 0%, #697282 100%)" }}
								>
									your work
								</p>
							</div>
						) : (
							<div>
								<h1 className={`${isFullscreen ? "text-[68px]" : "text-[44px]"} font-medium leading-[1.1] tracking-[-0.03em] text-white transition-all duration-500`}>
									Sharing work
								</h1>
								<p
									className={`${isFullscreen ? "text-[68px]" : "text-[44px]"} font-medium leading-[1.1] tracking-[-0.03em] bg-clip-text text-transparent transition-all duration-500`}
									style={{ backgroundImage: "linear-gradient(to bottom, white 0%, #697282 100%)" }}
								>
									made easy
								</p>
							</div>
						)}
					</motion.div>

					<motion.p
						initial={skipSlideAnimation ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={skipSlideAnimation ? { duration: 0 } : { delay: 0.7, duration: 0.6 }}
						className={`${isFullscreen ? "text-[18px] max-w-[480px]" : "text-[14px] max-w-[300px]"} leading-[1.5] text-white/60 text-center mt-4 transition-all duration-500`}
						key={`subtext-${displayVersion}`}
					>
						{displayVersion === 1
							? "localhost:3000 → shareable prototype"
							: "Preview links designed for feedback"}
					</motion.p>

					{/* Email form - animates in when fullscreen */}
					<AnimatePresence>
						{isFullscreen && (
							<motion.div
								initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
								transition={{ duration: 0.5, delay: 0.15 }}
								className="w-full max-w-[480px] mt-8"
							>
								<form onSubmit={onSubmit} className="relative">
									<AnimatePresence>
										{formStatus === "success" && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ duration: 0.4 }}
												className="absolute inset-0 rounded-full pointer-events-none animate-[greenPulse_2s_ease-in-out_infinite]"
											/>
										)}
										{formStatus === "error" && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.4 }}
												className="absolute inset-0 rounded-full pointer-events-none animate-[redPulse_2s_ease-in-out_infinite]"
											/>
										)}
									</AnimatePresence>

									<input
										type="email"
										required
										placeholder="your@email.com"
										value={email}
										onChange={(e) => onEmailChange(e.target.value)}
										disabled={formStatus === "success" || formStatus === "loading"}
										className="w-full h-[56px] pl-6 pr-16 rounded-full bg-neutral-900/80 hover:bg-[rgba(15,20,35,0.85)] text-white text-[16px] placeholder:text-neutral-500 outline-none transition-all shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] hover:shadow-[0_0_12px_2px_rgba(28,138,248,0.25),0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] focus:shadow-[0_0_0_0.5px_rgba(255,255,255,0.40),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)]"
										style={formStatus === "success" ? { color: "transparent" } : undefined}
									/>

									<AnimatePresence>
										{formStatus === "success" && (
											<>
												<motion.span
													initial={{ opacity: 1, filter: "blur(0px)" }}
													animate={{ opacity: 0, filter: "blur(8px)" }}
													transition={{ duration: 0.4 }}
													className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-[16px] pointer-events-none"
												>
													{email}
												</motion.span>
												<motion.span
													initial={{ opacity: 0, filter: "blur(8px)" }}
													animate={{ opacity: 1, filter: "blur(0px)" }}
													transition={{ duration: 0.4, delay: 0.2 }}
													className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-200 text-[16px] pointer-events-none"
												>
													You&apos;re on the list. We&apos;ll be in touch.
												</motion.span>
											</>
										)}
									</AnimatePresence>

									<motion.button
										type="submit"
										disabled={formStatus === "loading" || formStatus === "success"}
										className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-100"
										animate={{
											backgroundColor: formStatus === "success" ? "#22c55e" : formStatus === "error" ? "#f87171" : "#ffffff",
											boxShadow: formStatus === "success"
												? "0 0 12px 2px rgba(74, 222, 128, 0.4)"
												: formStatus === "error"
													? "0 0 12px 2px rgba(248, 113, 113, 0.4)"
													: "0 0 0 0.5px rgba(255,255,255,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1), 0 1px 1px -0.5px rgba(0,0,0,0.16)",
										}}
										transition={{ duration: 0.3 }}
									>
										<AnimatePresence mode="wait">
											{formStatus === "success" ? (
												<motion.svg
													key="check"
													initial={{ scale: 0, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													transition={{ type: "spring", stiffness: 400, damping: 15 }}
													width="18" height="18" viewBox="0 0 16 16" fill="none"
												>
													<motion.path
														d="M3 8.5L6.5 12L13 4"
														stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
														initial={{ pathLength: 0 }}
														animate={{ pathLength: 1 }}
														transition={{ duration: 0.4, delay: 0.1 }}
													/>
												</motion.svg>
											) : formStatus === "error" ? (
												<motion.svg
													key="x"
													initial={{ scale: 0, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													exit={{ opacity: 0, scale: 0.5 }}
													transition={{ type: "spring", stiffness: 400, damping: 15 }}
													width="16" height="16" viewBox="0 0 16 16" fill="none"
												>
													<motion.path
														d="M4 4L12 12M12 4L4 12"
														stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
														initial={{ pathLength: 0 }}
														animate={{ pathLength: 1 }}
														transition={{ duration: 0.4, delay: 0.1 }}
													/>
												</motion.svg>
											) : formStatus === "loading" ? (
												<motion.div
													key="spinner"
													className="w-4 h-4 border-2 border-neutral-800/30 border-t-neutral-800 rounded-full"
													animate={{ rotate: 360 }}
													transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
												/>
											) : (
												<motion.svg
													key="arrow"
													exit={{ opacity: 0, scale: 0.5 }}
													transition={{ duration: 0.15 }}
													width="16" height="16" viewBox="0 0 16 16" fill="none"
												>
													<path d="M3.5 8H12.5M9 4.5L12.5 8L9 11.5" stroke="#15161C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
												</motion.svg>
											)}
										</AnimatePresence>
									</motion.button>
								</form>
								<AnimatePresence>
									{errorMessage && formStatus === "error" && (
										<motion.p
											initial={{ opacity: 0, filter: "blur(8px)" }}
											animate={{ opacity: 1, filter: "blur(0px)" }}
											exit={{ opacity: 0, filter: "blur(8px)" }}
											transition={{ duration: 0.4 }}
											className="text-red-400 text-[13px] mt-3 text-center"
										>
											{errorMessage}
										</motion.p>
									)}
								</AnimatePresence>
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
									className="text-[14px] text-neutral-500 mt-4 text-center"
								>
									Join 3,000+ designers and get early access
								</motion.p>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</motion.div>
	);

	if (isFullscreen) {
		return createPortal(card, document.body);
	}

	return card;
}

function PlaceholderPreview({ isRunning, isV2Processing }: { isRunning?: boolean; isV2Processing?: boolean }) {
	return (
		<div className={`w-full h-full rounded-xl overflow-hidden border border-dashed transition-colors duration-700 bg-white/[0.02] flex flex-col ${isRunning ? "border-transparent" : "border-white/20"}`}>
			{/* Placeholder header to match SharePreview height */}
			<div className="bg-neutral-800/50 px-4 h-[52px] flex-shrink-0 flex items-center gap-2">
				<div className="flex gap-2">
					<div className="w-3 h-3 rounded-full bg-neutral-600" />
					<div className="w-3 h-3 rounded-full bg-neutral-600" />
					<div className="w-3 h-3 rounded-full bg-neutral-600" />
				</div>
				<div className="flex-1 flex justify-end sm:justify-center min-w-0">
					<div className="bg-neutral-700/50 rounded-md px-4 py-1.5 text-neutral-500 text-sm sm:min-w-[280px] min-w-0">
						&nbsp;
					</div>
				</div>
				<div className="w-8 hidden sm:block" />
			</div>
			<div className="flex-1 min-h-0 flex flex-col items-center justify-center text-neutral-500 p-8">
				<svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
				<p className="text-sm text-center">
					Your preview will appear here
					<br />
					<span className="text-neutral-600">
						{isV2Processing ? "Updating your preview" : "Run the command to deploy"}
					</span>
				</p>
			</div>
		</div>
	);
}

export default function SharePage() {
	const [isRunning, setIsRunning] = useState(false);
	const [isV2Running, setIsV2Running] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [v2Available, setV2Available] = useState(false);
	const [displayVersion, setDisplayVersion] = useState<1 | 2>(1);
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isV2Processing, setIsV2Processing] = useState(false);
	const previewRef = useRef<HTMLDivElement>(null);

	const scrollToPreview = useCallback(() => {
		if (window.innerWidth < 1024 && previewRef.current) {
			previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, []);

	const toggleFullscreen = useCallback(() => {
		setIsFullscreen((prev) => !prev);
	}, []);

	const handleRun = () => {
		setIsRunning(true);
	};

	const handleV2Run = () => {
		setIsV2Processing(true);
		setShowPreview(false);
		setIsV2Running(true);
	};

	const handleComplete = useCallback(() => {
		setShowPreview(true);
		// Small delay to let the preview render before scrolling
		setTimeout(() => scrollToPreview(), 100);
	}, [scrollToPreview]);

	const handleV2Complete = useCallback(() => {
		setV2Available(true);
		setDisplayVersion(2);
		setShowPreview(true);
		setIsV2Processing(false);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) return;

		setStatus("loading");
		setErrorMessage("");

		try {
			const res = await fetch("/api/share-waitlist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.trim() }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}

			setStatus("success");
		} catch (err) {
			setStatus("error");
			setErrorMessage("maybe double check that address?");
		}
	};

	return (
		<div className="h-screen overflow-y-auto lg:overflow-hidden bg-neutral-950 text-white flex flex-col">
			{/* Background gradient */}
			<div
				className="fixed inset-0 pointer-events-none"
				style={{
					background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(28, 138, 248, 0.12) 0%, transparent 60%)",
				}}
			/>

			<div className="relative z-10 flex flex-col items-center px-6 pt-10 sm:pt-12 pb-6 lg:flex-1 lg:min-h-0">
				{/* Logo */}
				<a href="https://inflight.co" target="_blank" rel="noopener noreferrer" className="mb-6">
					<div className="w-[120px] h-[120px] sm:w-[144px] sm:h-[144px] -mt-[44px] -mb-[64px] sm:-my-[44px]">
						<Lottie
							animationData={logoAnimationWhite}
							loop={false}
							autoplay={true}
							style={{ width: "100%", height: "100%" }}
						/>
					</div>
				</a>

				{/* Header text */}
				<motion.h1
					initial={{ opacity: 0, filter: `blur(${ANIMATION.blurAmount}px)` }}
					animate={{ opacity: 1, filter: "blur(0px)" }}
					transition={{ duration: ANIMATION.duration, ease: ANIMATION.easing }}
					className="text-[2rem] sm:text-4xl md:text-[3rem] md:leading-[3.4rem] lg:text-5xl font-medium text-center max-w-[700px] leading-[1.15] tracking-[-0.02em]"
				>
					<span className="text-white">Inflight is the </span>
					<span className="text-white">fastest</span>
					<span className="text-white"> way for designers to </span>
					<span
						className="bg-clip-text text-transparent"
						style={{ backgroundImage: "linear-gradient(to bottom, #60ADFA 0%, #1C8AF8 100%)" }}
					>
						collaborate
					</span>
					<span className="text-white"> in code.</span>
				</motion.h1>

				{/* Email signup form */}
				<motion.div
					className="w-full max-w-[480px] mt-10"
					initial={{ opacity: 0, filter: `blur(${ANIMATION.blurAmount}px)` }}
					animate={{ opacity: 1, filter: "blur(0px)" }}
					transition={{ duration: ANIMATION.duration, delay: ANIMATION.staggerDelay, ease: ANIMATION.easing }}
				>
					<form onSubmit={handleSubmit} className="relative">
						{/* Pulsing border overlay on success/error */}
						<AnimatePresence>
							{status === "success" && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.4 }}
									className="absolute inset-0 rounded-full pointer-events-none animate-[greenPulse_2s_ease-in-out_infinite]"
								/>
							)}
							{status === "error" && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.4 }}
									className="absolute inset-0 rounded-full pointer-events-none animate-[redPulse_2s_ease-in-out_infinite]"
								/>
							)}
						</AnimatePresence>

						{/* The input stays in place — just becomes non-interactive on success */}
						<input
							type="email"
							required
							placeholder="your@email.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (status === "error") { setStatus("idle"); setErrorMessage(""); }
							}}
							disabled={status === "success" || status === "loading"}
							className="w-full h-[56px] pl-6 pr-16 rounded-full bg-neutral-900/80 hover:bg-[rgba(15,20,35,0.85)] text-white text-[16px] placeholder:text-neutral-500 outline-none transition-all shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] hover:shadow-[0_0_12px_2px_rgba(28,138,248,0.25),0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] focus:shadow-[0_0_0_0.5px_rgba(255,255,255,0.40),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)]"
							style={status === "success" ? { color: "transparent" } : undefined}
						/>

						{/* Email text that blurs out on success */}
						<AnimatePresence>
							{status === "success" && (
								<>
									{/* Blurred-out email overlay (so the real input text is hidden) */}
									<motion.span
										initial={{ opacity: 1, filter: "blur(0px)" }}
										animate={{ opacity: 0, filter: "blur(8px)" }}
										transition={{ duration: 0.4 }}
										className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-[16px] pointer-events-none"
									>
										{email}
									</motion.span>

									{/* Success text blurs in */}
									<motion.span
										initial={{ opacity: 0, filter: "blur(8px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										transition={{ duration: 0.4, delay: 0.2 }}
										className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-200 text-[16px] pointer-events-none"
									>
										You&apos;re on the list. We&apos;ll be in touch.
									</motion.span>
								</>
							)}
						</AnimatePresence>

						{/* Submit button — morphs in place */}
						<motion.button
							type="submit"
							disabled={status === "loading" || status === "success"}
							className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-100"
							animate={{
								backgroundColor: status === "success" ? "#4ade80" : status === "error" ? "#f87171" : "#ffffff",
								boxShadow: status === "success"
									? "0 0 12px 2px rgba(74, 222, 128, 0.4)"
									: status === "error"
										? "0 0 12px 2px rgba(248, 113, 113, 0.4)"
										: "0 0 0 0.5px rgba(255,255,255,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1), 0 1px 1px -0.5px rgba(0,0,0,0.16)",
							}}
							transition={{ duration: 0.3 }}
						>
							<AnimatePresence mode="wait">
								{status === "success" ? (
									<motion.svg
										key="check"
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ type: "spring", stiffness: 400, damping: 15 }}
										width="18"
										height="18"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<motion.path
											d="M3 8.5L6.5 12L13 4"
											stroke="#ffffff"
											strokeWidth="2.5"
											strokeLinecap="round"
											strokeLinejoin="round"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 0.4, delay: 0.1 }}
										/>
									</motion.svg>
								) : status === "error" ? (
									<motion.svg
										key="x"
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ opacity: 0, scale: 0.5 }}
										transition={{ type: "spring", stiffness: 400, damping: 15 }}
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<motion.path
											d="M4 4L12 12M12 4L4 12"
											stroke="#ffffff"
											strokeWidth="2.5"
											strokeLinecap="round"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 0.4, delay: 0.1 }}
										/>
									</motion.svg>
								) : status === "loading" ? (
									<motion.div
										key="spinner"
										className="w-4 h-4 border-2 border-neutral-800/30 border-t-neutral-800 rounded-full"
										animate={{ rotate: 360 }}
										transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
									/>
								) : (
									<motion.svg
										key="arrow"
										exit={{ opacity: 0, scale: 0.5 }}
										transition={{ duration: 0.15 }}
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M3.5 8H12.5M9 4.5L12.5 8L9 11.5" stroke="#15161C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</motion.svg>
								)}
							</AnimatePresence>
						</motion.button>
					</form>
					<AnimatePresence>
						{status === "error" && (
							<motion.p
								initial={{ opacity: 0, filter: "blur(8px)" }}
								animate={{ opacity: 1, filter: "blur(0px)" }}
								exit={{ opacity: 0, filter: "blur(8px)" }}
								transition={{ duration: 0.4 }}
								className="text-red-400 text-[13px] mt-3 text-center"
							>
								{errorMessage}
							</motion.p>
						)}
					</AnimatePresence>
				</motion.div>

				<motion.p
					className="text-[14px] sm:text-[16px] text-neutral-500 mt-4 mb-6 sm:mb-8"
					initial={{ opacity: 0, filter: `blur(${ANIMATION.blurAmount}px)` }}
					animate={{ opacity: 1, filter: "blur(0px)" }}
					transition={{ duration: ANIMATION.duration, delay: ANIMATION.staggerDelay * 2, ease: ANIMATION.easing }}
				>
					Join 3,000+ designers and get early access
				</motion.p>

				{/* Side by side container */}
				<div className="w-full max-w-[640px] lg:max-w-[1500px] flex flex-col lg:flex-row gap-6 items-stretch lg:flex-1 lg:min-h-0">
					{/* Terminal */}
					<div className="w-full h-[400px] lg:h-auto lg:flex-1 lg:min-h-0">
						<TerminalWindow
							isRunning={isRunning}
							onRun={handleRun}
							onComplete={handleComplete}
							isV2Running={isV2Running}
							onV2Run={handleV2Run}
							onV2Complete={handleV2Complete}
							isFullscreen={isFullscreen}
							onScrollToPreview={scrollToPreview}
						/>
					</div>

					{/* Preview area */}
					<div ref={previewRef} className="w-full h-[400px] lg:h-auto lg:flex-1 lg:min-h-0 relative">
						{/* Paper shader border - visible while deploying or V2 processing */}
						<AnimatePresence>
							{(isRunning || isV2Processing) && !showPreview && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.8 }}
									className="absolute -inset-[3px] rounded-xl overflow-hidden pointer-events-none -z-10"
								>
									<PulsingBorder
										speed={1.75}
										roundness={0.04}
										thickness={0.02}
										softness={0.33}
										intensity={0}
										spots={2}
										spotSize={0.29}
										pulse={0}
										smoke={0.7}
										smokeSize={0.33}
										scale={1}
										rotation={0}
										bloom={0.21}
										colors={["#1C8AF8", "#1C8AF8"]}
										style={{ width: "100%", height: "100%" }}
									/>
								</motion.div>
							)}
						</AnimatePresence>
						{showPreview ? (
							<SharePreview
								isVisible={showPreview}
								v2Available={v2Available}
								displayVersion={displayVersion}
								onVersionChange={setDisplayVersion}
								isFullscreen={isFullscreen}
								onToggleFullscreen={toggleFullscreen}
								email={email}
								onEmailChange={(val: string) => {
									setEmail(val);
									if (status === "error") { setStatus("idle"); setErrorMessage(""); }
								}}
								onSubmit={handleSubmit}
								formStatus={status}
								errorMessage={errorMessage}
							/>
						) : isV2Processing ? (
							<PlaceholderPreview isRunning={true} isV2Processing={true} />
						) : (
							<PlaceholderPreview isRunning={isRunning} />
						)}
					</div>
				</div>

				{/* Bottom email capture - mobile only */}
				<div className="w-full max-w-[480px] mt-10 mb-4 lg:hidden">
					<form onSubmit={handleSubmit} className="relative">
						<AnimatePresence>
							{status === "success" && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.4 }}
									className="absolute inset-0 rounded-full pointer-events-none animate-[greenPulse_2s_ease-in-out_infinite]"
								/>
							)}
							{status === "error" && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.4 }}
									className="absolute inset-0 rounded-full pointer-events-none animate-[redPulse_2s_ease-in-out_infinite]"
								/>
							)}
						</AnimatePresence>

						<input
							type="email"
							required
							placeholder="your@email.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (status === "error") { setStatus("idle"); setErrorMessage(""); }
							}}
							disabled={status === "success" || status === "loading"}
							className="w-full h-[56px] pl-6 pr-16 rounded-full bg-neutral-900/80 hover:bg-[rgba(15,20,35,0.85)] text-white text-[16px] placeholder:text-neutral-500 outline-none transition-all shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] hover:shadow-[0_0_12px_2px_rgba(28,138,248,0.25),0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] focus:shadow-[0_0_0_0.5px_rgba(255,255,255,0.40),inset_0_2px_4px_0_rgba(0,0,0,0.2),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)]"
							style={status === "success" ? { color: "transparent" } : undefined}
						/>

						<AnimatePresence>
							{status === "success" && (
								<>
									<motion.span
										initial={{ opacity: 1, filter: "blur(0px)" }}
										animate={{ opacity: 0, filter: "blur(8px)" }}
										transition={{ duration: 0.4 }}
										className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-[16px] pointer-events-none"
									>
										{email}
									</motion.span>
									<motion.span
										initial={{ opacity: 0, filter: "blur(8px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										transition={{ duration: 0.4, delay: 0.2 }}
										className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-200 text-[16px] pointer-events-none"
									>
										You&apos;re on the list. We&apos;ll be in touch.
									</motion.span>
								</>
							)}
						</AnimatePresence>

						<motion.button
							type="submit"
							disabled={status === "loading" || status === "success"}
							className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-100"
							animate={{
								backgroundColor: status === "success" ? "#4ade80" : status === "error" ? "#f87171" : "#ffffff",
								boxShadow: status === "success"
									? "0 0 12px 2px rgba(74, 222, 128, 0.4)"
									: status === "error"
										? "0 0 12px 2px rgba(248, 113, 113, 0.4)"
										: "0 0 0 0.5px rgba(255,255,255,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1), 0 1px 1px -0.5px rgba(0,0,0,0.16)",
							}}
							transition={{ duration: 0.3 }}
						>
							<AnimatePresence mode="wait">
								{status === "success" ? (
									<motion.svg
										key="check"
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ type: "spring", stiffness: 400, damping: 15 }}
										width="18"
										height="18"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<motion.path
											d="M3 8.5L6.5 12L13 4"
											stroke="#ffffff"
											strokeWidth="2.5"
											strokeLinecap="round"
											strokeLinejoin="round"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 0.4, delay: 0.1 }}
										/>
									</motion.svg>
								) : status === "error" ? (
									<motion.svg
										key="x"
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ opacity: 0, scale: 0.5 }}
										transition={{ type: "spring", stiffness: 400, damping: 15 }}
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<motion.path
											d="M4 4L12 12M12 4L4 12"
											stroke="#ffffff"
											strokeWidth="2.5"
											strokeLinecap="round"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 0.4, delay: 0.1 }}
										/>
									</motion.svg>
								) : status === "loading" ? (
									<motion.div
										key="spinner"
										className="w-4 h-4 border-2 border-neutral-800/30 border-t-neutral-800 rounded-full"
										animate={{ rotate: 360 }}
										transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
									/>
								) : (
									<motion.svg
										key="arrow"
										exit={{ opacity: 0, scale: 0.5 }}
										transition={{ duration: 0.15 }}
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M3.5 8H12.5M9 4.5L12.5 8L9 11.5" stroke="#15161C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</motion.svg>
								)}
							</AnimatePresence>
						</motion.button>
					</form>
					<AnimatePresence>
						{status === "error" && (
							<motion.p
								initial={{ opacity: 0, filter: "blur(8px)" }}
								animate={{ opacity: 1, filter: "blur(0px)" }}
								exit={{ opacity: 0, filter: "blur(8px)" }}
								transition={{ duration: 0.4 }}
								className="text-red-400 text-[13px] mt-3 text-center"
							>
								{errorMessage}
							</motion.p>
						)}
					</AnimatePresence>
					<p className="text-[14px] text-neutral-500 mt-4 text-center">
						Join 3,000+ designers and get early access
					</p>
				</div>

			</div>
		</div>
	);
}
