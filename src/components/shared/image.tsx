import React from "react";

interface ImageLoaderParams {
	src: string;
	width: number;
	quality?: number;
}

export type ImageLoader = (params: ImageLoaderParams) => string;

export type ImageProps = Omit<
	React.ComponentProps<"img">,
	"src" | "width" | "height" | "loading" | "referrerPolicy"
> & {
	/**
	 * Image source.
	 */
	src: string;

	/**
	 * Alternative text.
	 */
	alt: string;

	/**
	 * Intrinsic image width.
	 */
	width?: number;

	/**
	 * Intrinsic image height.
	 */
	height?: number;

	/**
	 * Make the image fill its containing block.
	 *
	 * The parent should normally have:
	 *
	 * `position: relative`
	 */
	fill?: boolean;

	/**
	 * Controls how the image fits when `fill` is enabled.
	 */
	objectFit?: React.CSSProperties["objectFit"];

	/**
	 * Controls the image's object position.
	 */
	objectPosition?: React.CSSProperties["objectPosition"];

	/**
	 * Responsive image sizes.
	 *
	 * Example:
	 * `(max-width: 768px) 100vw, 50vw`
	 */
	sizes?: string;

	/**
	 * Optional responsive widths.
	 *
	 * When supplied together with `loader`, a `srcSet` is generated.
	 */
	widths?: readonly number[];

	/**
	 * Optional image transformation function.
	 *
	 * This is where you connect Cloudinary, ImageKit, Imgix,
	 * Supabase Storage, a custom image server, etc.
	 */
	loader?: ImageLoader;

	/**
	 * Image quality passed to the loader.
	 */
	quality?: number;

	/**
	 * Skip responsive image generation.
	 */
	unoptimized?: boolean;

	/**
	 * Load the image eagerly and give it high fetch priority.
	 *
	 * Intended for above-the-fold / LCP images.
	 */
	priority?: boolean;

	/**
	 * Display a low-quality/blurred placeholder while the image loads.
	 *
	 * Requires `blurDataURL`.
	 */
	placeholder?: "empty" | "blur";

	/**
	 * Tiny image shown while the real image loads.
	 *
	 * Required when `placeholder="blur"`.
	 */
	blurDataURL?: string;

	/**
	 * Called after the image finishes loading.
	 */
	onLoadingComplete?: (img: HTMLImageElement) => void;

	/**
	 * Whether the image should be decoded asynchronously.
	 */
	decoding?: React.ImgHTMLAttributes<HTMLImageElement>["decoding"];

	/**
	 * Controls browser fetch priority.
	 */
	fetchPriority?: React.HTMLAttributeReferrerPolicy extends never
		? never
		: "high" | "low" | "auto";
};

const DEFAULT_WIDTHS = [
	320, 480, 640, 750, 828, 960, 1080, 1200, 1440, 1920, 2560, 3840,
] as const;

const identityLoader: ImageLoader = ({ src }) => src;

const validateImageProps = ({
	fill,
	width,
	height,
	placeholder,
	blurDataURL,
}: Pick<
	ImageProps,
	"fill" | "width" | "height" | "placeholder" | "blurDataURL"
>) => {
	if (
		fill &&
		import.meta.env.DEV &&
		(width !== undefined || height !== undefined)
	) {
		console.warn(
			"Image: `width` and `height` are ignored when `fill` is true."
		);
	}

	if (placeholder === "blur" && !blurDataURL && import.meta.env.DEV) {
		throw new Error(
			'Image: `blurDataURL` is required when `placeholder="blur"`.'
		);
	}
};

const resolveImageProps = ({
	src,
	width,
	widths,
	loader,
	quality,
	unoptimized,
	priority,
	sizes,
	fill,
	fetchPriority,
}: {
	src: string;
	width: number | undefined;
	widths: readonly number[];
	loader?: ImageLoader;
	quality?: number;
	unoptimized: boolean;
	priority: boolean;
	sizes?: string;
	fill: boolean;
	fetchPriority?: "high" | "low" | "auto";
}) => {
	const resolvedLoader = loader ?? identityLoader;

	// SAFETY: DEFAULT_WIDTHS is non-empty, so .at(-1) is always defined.
	const fallbackWidth = widths.at(-1) as number;
	const resolvedSrc = resolvedLoader({
		src,
		width: width ?? fallbackWidth,
		quality,
	});

	const srcSet =
		!unoptimized && loader
			? widths
					.map((w) => `${loader({ src, width: w, quality })} ${w}w`)
					.join(", ")
			: undefined;

	const defaultSizes = fill ? "100vw" : undefined;
	const resolvedSizes = srcSet ? (sizes ?? defaultSizes) : sizes;

	const resolvedFetchPriority: "high" | "low" | "auto" =
		fetchPriority ?? (priority ? "high" : "auto");
	const resolvedLoading: "eager" | "lazy" = priority ? "eager" : "lazy";

	return {
		src: resolvedSrc,
		srcSet,
		sizes: resolvedSizes,
		fetchPriority: resolvedFetchPriority,
		loading: resolvedLoading,
	};
};

const getBlurTransition = (
	placeholder: "empty" | "blur",
	blurDataURL: string | undefined,
	loaded: boolean,
	objectPosition: React.CSSProperties["objectPosition"]
) => {
	if (placeholder !== "blur" || !blurDataURL) {
		return;
	}

	// SAFETY: null values unset CSS properties in React; valid but not in CSSProperties type.
	return {
		backgroundImage: loaded ? null : `url("${blurDataURL}")`,
		backgroundSize: loaded ? undefined : "cover",
		backgroundPosition: loaded ? undefined : (objectPosition ?? "center"),
		backgroundRepeat: loaded ? undefined : "no-repeat",
		filter: loaded ? null : "blur(12px)",
		transform: loaded ? null : "scale(1.02)",
	} as React.CSSProperties;
};

const buildImageStyle = (
	baseStyle: React.CSSProperties | undefined,
	fill: boolean,
	objectFit: React.CSSProperties["objectFit"],
	objectPosition: React.CSSProperties["objectPosition"],
	blurTransition: React.CSSProperties | undefined
): React.CSSProperties => ({
	...baseStyle,
	...(fill && {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		objectFit: objectFit ?? "cover",
		objectPosition,
	}),
	...blurTransition,
});

export const Image = ({
	src,
	alt,
	width,
	height,
	fill = false,
	objectFit,
	objectPosition,
	sizes,
	widths = DEFAULT_WIDTHS,
	loader,
	quality,
	unoptimized = false,
	priority = false,
	placeholder = "empty",
	blurDataURL,
	onLoadingComplete,
	onLoad,
	className,
	style,
	decoding = "async",
	fetchPriority: _fetchPriority,
	ref,
	...rest
}: ImageProps & { ref?: React.Ref<HTMLImageElement> }) => {
	const [loaded, setLoaded] = React.useState(false);

	validateImageProps({ fill, width, height, placeholder, blurDataURL });

	const {
		src: resolvedSrc,
		srcSet,
		sizes: resolvedSizes,
		...resolvedProps
	} = resolveImageProps({
		src,
		width,
		widths,
		loader,
		quality,
		unoptimized,
		priority,
		sizes,
		fill,
		fetchPriority: _fetchPriority,
	});

	const blurTransition = getBlurTransition(
		placeholder,
		blurDataURL,
		loaded,
		objectPosition
	);

	const imageStyle = buildImageStyle(
		style,
		fill,
		objectFit,
		objectPosition,
		blurTransition
	);

	const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
		setLoaded(true);
		onLoad?.(event);

		if (onLoadingComplete) {
			onLoadingComplete(event.currentTarget);
		}
	};

	return (
		<img
			ref={ref}
			src={resolvedSrc}
			srcSet={srcSet}
			sizes={resolvedSizes}
			width={fill ? undefined : width}
			height={fill ? undefined : height}
			alt={alt}
			loading={resolvedProps.loading}
			decoding={decoding}
			fetchPriority={resolvedProps.fetchPriority}
			className={className}
			style={imageStyle}
			onLoad={handleLoad}
			{...rest}
		/>
	);
};
