import * as React from "react";

export interface ShimmerTextProps {
	children: React.ReactNode;
	color?: string;
	duration?: number;
	width?: number;
	className?: string;
}

const ShimmerText = ({
	children,
	color = "#BFDEFD",
	duration = 3,
	width = 50,
	className,
}: ShimmerTextProps) => {
	return (
		<>
			<style>{`
				@keyframes shimmer-sweep {
					0% { background-position: 200% center; }
					100% { background-position: -200% center; }
				}
			`}</style>
			<span
				className={className}
				style={{
					background: `linear-gradient(90deg, #fff ${50 - width}%, ${color} 50%, #fff ${50 + width}%)`,
					backgroundSize: "200% 100%",
					WebkitBackgroundClip: "text",
					backgroundClip: "text",
					WebkitTextFillColor: "transparent",
					animation: `shimmer-sweep ${duration}s linear infinite`,
				}}
			>
				{children}
			</span>
		</>
	);
};

ShimmerText.displayName = "ShimmerText";

export { ShimmerText };
