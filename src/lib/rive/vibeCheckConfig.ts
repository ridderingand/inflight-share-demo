import { Layout, Fit, Alignment } from "@rive-app/react-webgl2";

export const VIBE_CHECK_RIVE_SRC = "/animations/vibe_check_slider.riv";

export const VIBE_CHECK_RIVE_CONFIG = {
	artboard: "main",
	stateMachines: "State Machine 1",
	autoBind: true,
	autoplay: true,
} as const;

export function createRiveLayout(fit: Fit = Fit.Contain, alignment: Alignment = Alignment.Center): Layout {
	return new Layout({ fit, alignment });
}

export const VIBE_CHECK_LAYOUTS = {
	contain: createRiveLayout(Fit.Contain, Alignment.Center),
	cover: createRiveLayout(Fit.Cover, Alignment.Center),
} as const;
