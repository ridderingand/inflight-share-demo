"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import logoAnimationWhite from "../../../../public/animations/logo-animation-white.json";

const GENERATED_URL = "inflight.co/v/a8f3k2m9";
const GENERATED_URL_V2 = "inflight.co/v/b9g4l3n0";

const CODE_LINES = [
	{ text: "Write(inflight-landing.html)", color: "text-blue-400" },
	{ text: "  I wrote 344 lines to inflight-landing.html", color: "text-neutral-500" },
	{ text: '  <!DOCTYPE html>', color: "text-orange-400" },
	{ text: '  <html lang="en">', color: "text-orange-400" },
	{ text: "  <head>", color: "text-orange-400" },
	{ text: '    <meta charset="UTF-8">', color: "text-neutral-400" },
	{ text: '    <meta name="viewport" content="width=device-width">', color: "text-neutral-400" },
	{ text: '    <title>Inflight - Share your work</title>', color: "text-neutral-400" },
	{ text: '    <link rel="stylesheet" href="styles.css">', color: "text-neutral-400" },
	{ text: "  </head>", color: "text-orange-400" },
	{ text: "  <body>", color: "text-orange-400" },
	{ text: '    <main class="container">', color: "text-green-400" },
	{ text: "  ...", color: "text-neutral-600" },
	{ text: "  +334 lines (ctrl+o to expand)", color: "text-neutral-600", isCollapsed: true },
	{ text: "", color: "" },
	{ text: '\u2713 Done. Created inflight-landing.html', color: "text-green-400" },
	{ text: "", color: "" },
];

const TERMINAL_STEPS = [
	{ text: "", delay: 200 },
	{ text: "Connecting to Inflight...", delay: 300, color: "text-yellow-400" },
	{ text: "\u2713 Authenticated with Claude", delay: 350, color: "text-green-400" },
	{ text: "", delay: 100 },
	{ text: "Setting up environment...", delay: 200, color: "text-neutral-400" },
	{ text: "Building preview...", delay: 350, color: "text-neutral-400" },
	{ text: "Deploying to edge...", delay: 300, color: "text-neutral-400" },
	{ text: "", delay: 100 },
	{ text: `\u2713 Live at https://${GENERATED_URL}`, delay: 500, isLink: true, color: "text-green-400" },
];

const V2_CODE_LINES = [
	{ text: "", color: "" },
	{ text: "Edit(inflight-landing.html)", color: "text-blue-400" },
	{ text: "  Updating H1 headline...", color: "text-neutral-500" },
	{ text: '  - <h1 class="hero-title">/share your work</h1>', color: "text-red-400" },
	{ text: '  + <h1 class="hero-title">Sharing work made easy</h1>', color: "text-green-400" },
	{ text: "", color: "" },
	{ text: "\u2713 Done. Updated inflight-landing.html", color: "text-green-400" },
	{ text: "", color: "" },
];

const V2_TERMINAL_STEPS = [
	{ text: "", delay: 400 },
	{ text: "Syncing changes...", delay: 500, color: "text-yellow-400" },
	{ text: "Building preview...", delay: 600, color: "text-neutral-400" },
	{ text: "Deploying V2 to edge...", delay: 500, color: "text-neutral-400" },
	{ text: "", delay: 200 },
	{ text: `\u2713 V2 Live at https://${GENERATED_URL_V2}`, delay: 800, isLink: true, isV2: true, color: "text-green-400" },
];

function TerminalWindow({
	onComplete,
	onV2Complete,
	isRunning,
	onRun,
	isV2Running,
	onV2Run,
}: {
	onComplete: () => void;
	onV2Complete: () => void;
	isRunning: boolean;
	onRun: () => void;
	isV2Running: boolean;
	onV2Run: () => void;
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
	}, [codeLines, terminalLines, v2CodeLines, v2TerminalLines, showV2Prompt, scrollToBottom]);

	// Animate code lines on mount
	useEffect(() => {
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
		if (!isRunning) return;

		let totalDelay = 0;

		TERMINAL_STEPS.forEach((step, index) => {
			totalDelay += step.delay;
			const isLastStep = index === TERMINAL_STEPS.length - 1;

			setTimeout(() => {
				setTerminalLines((prev) => [...prev, step]);
				if (isLastStep) {
					setIsComplete(true);
					onComplete();
					// Start V2 code animation after 1.5 seconds
					setTimeout(() => {
						let v2LineIndex = 0;
						const v2Interval = setInterval(() => {
							if (v2LineIndex < V2_CODE_LINES.length) {
								setV2CodeLines((prev) => [...prev, V2_CODE_LINES[v2LineIndex]]);
								v2LineIndex++;
							} else {
								clearInterval(v2Interval);
								setV2CodeComplete(true);
								setShowV2Prompt(true);
							}
						}, 60);
					}, 1500);
				}
			}, totalDelay);
		});
	}, [isRunning, onComplete]);

	// Phase 2: Run V2 update
	useEffect(() => {
		if (!isV2Running) return;

		setShowV2Prompt(false);
		let totalDelay = 0;

		V2_TERMINAL_STEPS.forEach((step, index) => {
			totalDelay += step.delay;
			const isLastStep = index === V2_TERMINAL_STEPS.length - 1;

			setTimeout(() => {
				setV2TerminalLines((prev) => [...prev, step]);
				if (isLastStep) {
					setIsV2Complete(true);
					onV2Complete();
				}
			}, totalDelay);
		});
	}, [isV2Running, onV2Complete]);

	// Keyboard handler
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Enter") {
				if (!isRunning && !isComplete && codeComplete) {
					onRun();
				} else if (showV2Prompt && !isV2Running && !isV2Complete) {
					onV2Run();
				}
			}
		},
		[isRunning, isComplete, codeComplete, showV2Prompt, isV2Running, isV2Complete, onRun, onV2Run]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className="w-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
			{/* Terminal header */}
			<div className="bg-neutral-800 px-4 h-[52px] flex items-center gap-2">
				<div className="flex gap-2">
					<div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
					<div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
					<div className="w-3 h-3 rounded-full bg-[#27CA40]" />
				</div>
				<div className="flex-1 text-center text-neutral-400 text-sm font-mono">
					claude — Terminal
				</div>
				<div className="w-14" />
			</div>

			{/* Terminal body */}
			<div
				ref={terminalRef}
				className="bg-[#0d1117] p-4 font-mono text-sm h-[450px] overflow-y-auto"
			>
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
						<button
							onClick={onRun}
							className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-md text-white text-xs font-medium transition-colors flex items-center gap-2"
						>
							enter
							<span className="text-neutral-400">↵</span>
						</button>
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
						<button
							onClick={onV2Run}
							className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-md text-white text-xs font-medium transition-colors flex items-center gap-2"
						>
							enter
							<span className="text-neutral-400">↵</span>
						</button>
						<span className="text-neutral-500 text-xs">to update</span>
					</motion.div>
				)}
			</div>
		</div>
	);
}

function FeedbackGuide({ isExpanded }: { isExpanded: boolean }) {
	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: 1.5, duration: 0.4 }}
			className={`absolute right-3 top-3 bottom-3 flex flex-col gap-2 transition-all duration-300 ${
				isExpanded ? "w-[200px]" : "w-[140px]"
			}`}
		>
			{/* Guide card */}
			<div className="bg-neutral-900/90 backdrop-blur-sm rounded-lg border border-white/10 p-3 flex-1 flex flex-col">
				<div className="flex items-center gap-2 mb-3">
					<div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
						<svg width="10" height="10" viewBox="0 0 16 16" fill="none">
							<path d="M8 1v14M1 8h14" stroke="#1C8AF8" strokeWidth="2" strokeLinecap="round" />
						</svg>
					</div>
					<span className={`font-medium text-white transition-all ${isExpanded ? "text-[13px]" : "text-[11px]"}`}>
						Feedback Guide
					</span>
				</div>

				<div className="flex-1 flex flex-col gap-2">
					{/* Question 1 */}
					<div className={`bg-white/5 rounded-md p-2 border border-white/5 transition-all ${isExpanded ? "" : "scale-95"}`}>
						<p className={`text-neutral-400 transition-all ${isExpanded ? "text-[11px]" : "text-[9px]"}`}>
							Is the headline clear?
						</p>
						<div className="flex gap-1 mt-1.5">
							<div className={`rounded bg-green-500/20 text-green-400 flex items-center justify-center transition-all ${isExpanded ? "w-6 h-6 text-[10px]" : "w-4 h-4 text-[8px]"}`}>
								+
							</div>
							<div className={`rounded bg-red-500/20 text-red-400 flex items-center justify-center transition-all ${isExpanded ? "w-6 h-6 text-[10px]" : "w-4 h-4 text-[8px]"}`}>
								-
							</div>
						</div>
					</div>

					{/* Question 2 */}
					<div className={`bg-white/5 rounded-md p-2 border border-white/5 transition-all ${isExpanded ? "" : "scale-95"}`}>
						<p className={`text-neutral-400 transition-all ${isExpanded ? "text-[11px]" : "text-[9px]"}`}>
							Rate the design
						</p>
						<div className="flex gap-0.5 mt-1.5">
							{[1, 2, 3, 4, 5].map((star) => (
								<svg
									key={star}
									className={`text-yellow-500/60 transition-all ${isExpanded ? "w-4 h-4" : "w-3 h-3"}`}
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
							))}
						</div>
					</div>

					{/* Question 3 - only visible when expanded */}
					{isExpanded && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="bg-white/5 rounded-md p-2 border border-white/5"
						>
							<p className="text-[11px] text-neutral-400">Any suggestions?</p>
							<div className="mt-1.5 h-6 rounded bg-white/5 border border-white/10" />
						</motion.div>
					)}
				</div>

				{/* Submit hint */}
				<div className={`mt-2 pt-2 border-t border-white/5 transition-all ${isExpanded ? "" : "scale-95 origin-left"}`}>
					<div className={`flex items-center gap-1.5 text-neutral-500 ${isExpanded ? "text-[10px]" : "text-[8px]"}`}>
						<svg className={`transition-all ${isExpanded ? "w-3 h-3" : "w-2 h-2"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						<span>AI-generated questions</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

function SharePreview({
	isVisible,
	email,
	setEmail,
	onSubmit,
	status,
	headline,
	isV2,
	isFullscreen,
	onToggleFullscreen,
}: {
	isVisible: boolean;
	email: string;
	setEmail: (email: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	status: "idle" | "loading" | "success" | "error";
	headline: "default" | "v2";
	isV2: boolean;
	isFullscreen: boolean;
	onToggleFullscreen: () => void;
}) {
	const [isHovered, setIsHovered] = useState(false);

	if (!isVisible) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.3 }}
			className={`rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
				isFullscreen
					? "fixed inset-4 z-50"
					: "w-full"
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

			{/* Browser chrome */}
			<div className="bg-neutral-800 px-4 h-[52px] flex items-center gap-2 relative">
				<div className="flex gap-2">
					<div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
					<div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
					<div className="w-3 h-3 rounded-full bg-[#27CA40]" />
				</div>
				<div className="flex-1 flex justify-center">
					<div className="bg-neutral-700 rounded-md px-4 py-1.5 text-neutral-300 text-sm flex items-center gap-2 min-w-[280px]">
						<svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<span className="text-neutral-400">{isV2 ? GENERATED_URL_V2 : GENERATED_URL}</span>
					</div>
				</div>
				{/* Fullscreen button */}
				<AnimatePresence>
					{(isHovered || isFullscreen) && (
						<motion.button
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							onClick={onToggleFullscreen}
							className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors"
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
			</div>

			{/* Share page preview - mimics /share/1 */}
			<div
				className={`relative overflow-hidden transition-all duration-300 ${
					isFullscreen ? "flex-1" : "h-[450px]"
				}`}
				style={{
					background: "linear-gradient(180deg, #0a0a0c 0%, #0f1012 100%)",
				}}
			>
				{/* Gradient orb effect */}
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(28, 138, 248, 0.12) 0%, transparent 70%)",
					}}
				/>

				{/* Feedback Guide */}
				<FeedbackGuide isExpanded={isFullscreen} />

				{/* Content */}
				<div className={`relative z-10 flex flex-col items-center pt-8 transition-all duration-300 ${
					isFullscreen ? "px-12" : "px-6"
				}`}>
					{/* Mini logo */}
					<div className="w-12 h-12 mb-6">
						<Lottie
							animationData={logoAnimationWhite}
							loop={false}
							autoplay={true}
							style={{ width: "100%", height: "100%" }}
						/>
					</div>

					{/* Hero text */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.6 }}
						className="text-center"
						key={headline}
					>
						<AnimatePresence mode="wait">
							{headline === "default" ? (
								<motion.div
									key="default"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.4 }}
								>
									<h1 className="text-[48px] font-medium leading-[1] tracking-[-0.03em] text-white">
										<span className="italic opacity-90">/</span>share
									</h1>
									<p
										className="text-[48px] font-medium leading-[1] tracking-[-0.03em] bg-clip-text text-transparent -mt-1"
										style={{ backgroundImage: "linear-gradient(to bottom, white 0%, #697282 100%)" }}
									>
										your work
									</p>
								</motion.div>
							) : (
								<motion.div
									key="v2"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.4 }}
								>
									<h1 className="text-[44px] font-medium leading-[1.1] tracking-[-0.03em] text-white">
										Sharing work
									</h1>
									<p
										className="text-[44px] font-medium leading-[1.1] tracking-[-0.03em] bg-clip-text text-transparent"
										style={{ backgroundImage: "linear-gradient(to bottom, white 0%, #697282 100%)" }}
									>
										made easy
									</p>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.7, duration: 0.6 }}
						className="text-[14px] leading-[1.5] text-white/60 text-center max-w-[300px] mt-4"
					>
						Inflight is the fastest and simplest way to collaborate in code.
					</motion.p>

					{/* Email input preview */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.9, duration: 0.5 }}
						className="w-full max-w-[320px] mt-6"
					>
						{status === "success" ? (
							<div className="flex items-center justify-center h-[44px] rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 text-[13px]">
								You&apos;re on the list!
							</div>
						) : (
							<form onSubmit={onSubmit} className="relative">
								<input
									type="email"
									required
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full h-[44px] pl-5 pr-14 rounded-full bg-white/[0.06] backdrop-blur-xl text-white text-[14px] placeholder:text-neutral-500 outline-none transition-all shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.05)] focus:shadow-[0_0_0_0.5px_rgba(255,255,255,0.20),inset_0_1px_0_0_rgba(255,255,255,0.08)]"
								/>
								<button
									type="submit"
									disabled={status === "loading"}
									className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-neutral-100 transition-all disabled:opacity-50"
								>
									<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M3 8.5L6.5 12L13 4" stroke="#15161C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</button>
							</form>
						)}
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.1, duration: 0.5 }}
						className="text-[12px] text-neutral-500 mt-3"
					>
						Join 3,000+ designers and get early access
					</motion.p>
				</div>
			</div>
		</motion.div>
	);
}

function PlaceholderPreview() {
	return (
		<div className="w-full rounded-xl overflow-hidden border border-dashed border-white/20 bg-white/[0.02]">
			{/* Placeholder header to match SharePreview height */}
			<div className="bg-neutral-800/50 px-4 h-[52px] flex items-center gap-2">
				<div className="flex gap-2">
					<div className="w-3 h-3 rounded-full bg-neutral-600" />
					<div className="w-3 h-3 rounded-full bg-neutral-600" />
					<div className="w-3 h-3 rounded-full bg-neutral-600" />
				</div>
				<div className="flex-1 flex justify-center">
					<div className="bg-neutral-700/50 rounded-md px-4 py-1.5 text-neutral-500 text-sm min-w-[280px]">
						&nbsp;
					</div>
				</div>
				<div className="w-14" />
			</div>
			<div className="h-[450px] flex flex-col items-center justify-center text-neutral-500 p-8">
				<svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
				<p className="text-sm text-center">
					Your preview will appear here
					<br />
					<span className="text-neutral-600">Run the command above to deploy</span>
				</p>
			</div>
		</div>
	);
}

export default function SharePage() {
	const [isRunning, setIsRunning] = useState(false);
	const [isV2Running, setIsV2Running] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [previewHeadline, setPreviewHeadline] = useState<"default" | "v2">("default");
	const [isV2, setIsV2] = useState(false);
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [isFullscreen, setIsFullscreen] = useState(false);

	const toggleFullscreen = useCallback(() => {
		setIsFullscreen((prev) => !prev);
	}, []);

	const handleRun = () => {
		setIsRunning(true);
	};

	const handleV2Run = () => {
		setIsV2Running(true);
	};

	const handleComplete = () => {
		setTimeout(() => {
			setShowPreview(true);
		}, 300);
	};

	const handleV2Complete = () => {
		setTimeout(() => {
			setPreviewHeadline("v2");
			setIsV2(true);
		}, 300);
	};

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
			setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
		}
	};

	return (
		<div className="min-h-screen bg-neutral-950 text-white">
			{/* Background gradient */}
			<div
				className="fixed inset-0 pointer-events-none"
				style={{
					background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(28, 138, 248, 0.12) 0%, transparent 60%)",
				}}
			/>

			<div className="relative z-10 flex flex-col items-center px-6 py-16 sm:py-20">
				{/* Logo */}
				<div className="mb-6">
					<div className="w-[100px] h-[100px] -my-[30px]">
						<Lottie
							animationData={logoAnimationWhite}
							loop={false}
							autoplay={true}
							style={{ width: "100%", height: "100%" }}
						/>
					</div>
				</div>

				{/* Header text */}
				<motion.h1
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className="text-3xl sm:text-4xl lg:text-5xl font-medium text-center max-w-[700px] leading-[1.15] tracking-[-0.02em]"
				>
					<span className="text-white">Inflight is the </span>
					<span className="text-white italic">fastest</span>
					<span className="text-white"> way for designers to </span>
					<span className="text-primary">collaborate</span>
					<span
						className="bg-clip-text text-transparent"
						style={{ backgroundImage: "linear-gradient(to bottom, white 0%, #697282 100%)" }}
					>
						{" "}in code.
					</span>
				</motion.h1>

				{/* Email signup form */}
				<motion.div
					className="w-full max-w-[480px] mt-10"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.5 }}
				>
					{status === "success" ? (
						<div className="flex items-center justify-center h-[56px] rounded-full bg-white/5 border border-white/10 text-neutral-200 text-[16px]">
							You&apos;re on the list. We&apos;ll be in touch.
						</div>
					) : (
						<form onSubmit={handleSubmit} className="relative">
							<input
								type="email"
								required
								placeholder="your@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full h-[56px] pl-6 pr-16 rounded-full bg-white/[0.06] backdrop-blur-xl text-white text-[16px] placeholder:text-neutral-500 outline-none transition-all shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] focus:shadow-[0_0_0_0.5px_rgba(255,255,255,0.20),inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)]"
							/>
							<button
								type="submit"
								disabled={status === "loading"}
								className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-neutral-100 transition-all shadow-[0_0_0_0.5px_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1),0_1px_1px_-0.5px_rgba(0,0,0,0.16)] hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1),0_3px_3px_-1.5px_rgba(0,0,0,0.16)] disabled:opacity-50"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M3 8.5L6.5 12L13 4" stroke="#15161C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
						</form>
					)}
					{status === "error" && (
						<p className="text-red-400 text-[13px] mt-3 text-center">{errorMessage}</p>
					)}
				</motion.div>

				<motion.p
					className="text-[14px] sm:text-[16px] text-neutral-500 mt-4 mb-12 sm:mb-16"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6, duration: 0.5 }}
				>
					Join 3,000+ designers and get early access
				</motion.p>

				{/* Side by side container */}
				<div className="w-full max-w-[1500px] flex flex-col lg:flex-row gap-6 items-start">
					{/* Terminal */}
					<div className="w-full lg:flex-1">
						<TerminalWindow
							isRunning={isRunning}
							onRun={handleRun}
							onComplete={handleComplete}
							isV2Running={isV2Running}
							onV2Run={handleV2Run}
							onV2Complete={handleV2Complete}
						/>
					</div>

					{/* Preview area */}
					<div className="w-full lg:flex-1">
						{showPreview ? (
							<SharePreview
								isVisible={showPreview}
								email={email}
								setEmail={setEmail}
								onSubmit={handleSubmit}
								status={status}
								headline={previewHeadline}
								isV2={isV2}
								isFullscreen={isFullscreen}
								onToggleFullscreen={toggleFullscreen}
							/>
						) : (
							<PlaceholderPreview />
						)}
					</div>
				</div>

			</div>
		</div>
	);
}
