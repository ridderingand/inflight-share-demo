import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
	// Base styles - shared across all buttons
	"inline-flex items-center justify-center font-medium transition-all disabled:cursor-not-allowed relative active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black bg-clip-padding",
	{
		variants: {
			variant: {
				primary: [
					// Box-shadow border + outer shadows + inner highlight
					"shadow-[0_0_0_0.5px_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1),0_1px_1px_-0.5px_rgba(0,0,0,0.16)]",
					"text-white",
					"hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)]",
					"disabled:shadow-none",
					"[text-shadow:0_1px_2px_rgba(0,0,0,0.15)]",
					"[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.20))]",
				],
				secondary: [
					// Lighter border + more shadows for elevated feel
					"shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)]",
					"text-white",
					"hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16),0_6px_6px_-3px_rgba(0,0,0,0.16)]",
					"disabled:opacity-50",
					"disabled:shadow-none",
					"[text-shadow:0_1px_2px_rgba(0,0,0,0.30)]",
					"[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.20))]",
				],
				tertiary: [
					// Same border as ghost + background + minimal shadows for flatter appearance
					"bg-white/[0.03]",
					"shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_1px_-0.5px_rgba(0,0,0,0.16)]",
					"text-white",
					"hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_1px_-0.5px_rgba(0,0,0,0.16),0_3px_3px_-1.5px_rgba(0,0,0,0.16)]",
					"hover:bg-white/5",
					"disabled:bg-transparent",
					"disabled:shadow-none",
					"[text-shadow:0_1px_1px_rgba(0,0,0,0.20)]",
				],
				ghost: [
					// Border only, no outer shadows for ghost feel
					"bg-transparent",
					"shadow-[0_0_0_0.5px_rgba(255,255,255,0.10)]",
					"text-white",
					"hover:bg-white/[0.03]",
					"hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.10),inset_0_1px_0_0_rgba(255,255,255,0.02)]",
					"disabled:shadow-[0_0_0_0.5px_rgba(255,255,255,0.05)]",
					"disabled:bg-transparent",
					"[text-shadow:0_1px_1px_rgba(0,0,0,0.20)]",
				],
				transparent: [
					// No border by default, adds on hover
					"bg-transparent",
					"text-neutral-300",
					"hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.05)]",
					"hover:bg-white/5",
					"hover:text-white",
					"disabled:bg-transparent",
					"disabled:text-white",
					"[text-shadow:0_1px_1px_rgba(0,0,0,0.20)]",
				],
			},
			size: {
				xs: "h-6 px-1 gap-0 rounded-[6px] text-[12px] font-medium leading-[120%]",
				sm: "h-8 px-2 gap-1 rounded-[8px] text-[14px] font-medium leading-[120%]",
				md: "h-9 px-2.5 gap-1 rounded-[10px] text-[14px] font-medium leading-[120%]",
				lg: "h-10 px-3 gap-1 rounded-[12px] text-[14px] font-medium leading-[120%]",
				xl: "h-12 px-4 gap-1 rounded-[12px] text-[16px] font-medium leading-[120%]",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	loading?: boolean;
	shimmer?: boolean;
	shimmerColor?: string;
	shimmerDuration?: number;
	shimmerWidth?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, leftIcon, rightIcon, loading, disabled, children, style, shimmer, shimmerColor = "#BFDEFD", shimmerDuration = 3, shimmerWidth = 50, ...props }, ref) => {
		const isDisabled = disabled || loading;
		const [isHovered, setIsHovered] = React.useState(false);

		// Determine icon opacity based on variant and disabled state
		const getIconOpacity = () => {
			if (!isDisabled) return "opacity-100";

			if (variant === "primary") return "opacity-40";
			if (variant === "secondary") return "opacity-40";
			if (variant === "tertiary" || variant === "ghost" || variant === "transparent") return "opacity-40";
			return "opacity-100";
		};

		// Determine text opacity based on variant and disabled state
		const getTextOpacity = () => {
			if (!isDisabled) return "opacity-100";

			if (variant === "primary") return "opacity-40";
			if (variant === "secondary") return "opacity-80";
			if (variant === "tertiary" || variant === "ghost") return "opacity-40";
			if (variant === "transparent") return "opacity-40";
			return "opacity-100";
		};

		// Get background styles for complex gradients with blend modes
		const getBackgroundStyle = (): React.CSSProperties => {
			if (isDisabled) {
				if (variant === "primary") {
					return {
						background: "rgba(255, 255, 255, 0.10)",
					};
				}
				if (variant === "secondary") {
					return {
						background: "#2E3138",
					};
				}
				return {};
			}

			if (variant === "primary") {
				if (isHovered) {
					return {
						background:
							"linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 50.48%), #0080F0",
						backgroundBlendMode: "normal, plus-lighter, normal",
					};
				}
				return {
					background:
						"linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 50.48%), #0080F0",
					backgroundBlendMode: "plus-lighter, normal",
				};
			}

			if (variant === "secondary") {
				if (isHovered) {
					return {
						background:
							"linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.03) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 50.48%), #2E3138",
						backgroundBlendMode: "normal, plus-lighter, normal",
					};
				}
				return {
					background:
						"linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 50.48%), #2E3138",
					backgroundBlendMode: "plus-lighter, normal",
				};
			}

			return {};
		};

		const iconOpacity = getIconOpacity();
		const textOpacity = getTextOpacity();
		const backgroundStyle = getBackgroundStyle();

		return (
			<button
				className={buttonVariants({ variant, size, className })}
				ref={ref}
				disabled={isDisabled}
				style={{ ...backgroundStyle, ...style }}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				{...props}
			>
				{shimmer && (
					<style>{`
						@keyframes shimmer-sweep {
							0% { background-position: 200% center; }
							100% { background-position: -200% center; }
						}
					`}</style>
				)}
				{loading ? (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
				) : (
					<>
						{leftIcon && <span className={`flex-shrink-0 ${iconOpacity}`}>{leftIcon}</span>}
						{children && (
							<div
								className={`px-1 ${textOpacity}`}
								style={shimmer ? {
									background: `linear-gradient(90deg, #fff ${50 - shimmerWidth}%, ${shimmerColor} 50%, #fff ${50 + shimmerWidth}%)`,
									backgroundSize: '200% 100%',
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									animation: `shimmer-sweep ${shimmerDuration}s linear infinite`,
								} : undefined}
							>
								{children}
							</div>
						)}
						{rightIcon && <span className={`flex-shrink-0 ${iconOpacity}`}>{rightIcon}</span>}
					</>
				)}
			</button>
		);
	}
);

Button.displayName = "Button";

export { Button, buttonVariants };
