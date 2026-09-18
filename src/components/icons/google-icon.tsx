/* oxlint-disable shadcn/no-raw-colors */
import type { SVGProps } from "react";

export const GoogleIcon = ({
	size = 20,
	...props
}: SVGProps<SVGSVGElement> & { size?: number }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		{...props}
	>
		<path
			fill="#4285F4"
			d="M21.805 12.23c0-.79-.07-1.55-.202-2.28H12v4.32h5.492a4.69 4.69 0 0 1-2.036 3.078v2.553h3.292c1.927-1.775 3.057-4.39 3.057-7.67Z"
		/>
		<path
			fill="#34A853"
			d="M12 22c2.754 0 5.06-.912 6.748-2.476l-3.292-2.553c-.913.612-2.078.974-3.456.974-2.66 0-4.92-1.796-5.73-4.21H2.867v2.635A10.19 10.19 0 0 0 12 22Z"
		/>
		<path
			fill="#FBBC05"
			d="M6.27 13.735A6.13 6.13 0 0 1 5.95 12c0-.602.104-1.188.32-1.735V7.63H2.867A9.997 9.997 0 0 0 2 12c0 1.61.385 3.134 1.066 4.37l3.205-2.635Z"
		/>
		<path
			fill="#EA4335"
			d="M12 6.055c1.498 0 2.844.515 3.904 1.526l2.928-2.928C17.055 2.995 14.75 2 12 2a10.19 10.19 0 0 0-9.133 5.63l3.205 2.635c.81-2.414 3.07-4.21 5.928-4.21Z"
		/>
	</svg>
);
