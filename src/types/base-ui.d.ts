declare module "@base-ui/utils/store" {
	export const ReactStore: unknown;
}

declare module "@base-ui/utils/useTimeout" {
	export const Timeout: unknown;
}

declare module "@base-ui/utils/useEnhancedClickHandler" {
	export type InteractionType = unknown;
	const fn: unknown;
	export default fn;
}

declare module "@floating-ui/react-dom" {
	export * from "@floating-ui/dom";
}

declare module "@floating-ui/utils" {
	export * from "@floating-ui/dom";
}

declare module "*.css?url" {
	const url: string;
	export default url;
}
