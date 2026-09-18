import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
	ThemeProviderContext,
	resolveTheme,
} from "#/components/shared/theme-context.tsx";
import type { Theme } from "#/components/shared/theme-context.tsx";

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}

const readStoredTheme = (storageKey: string, defaultTheme: Theme): Theme => {
	if (typeof window === "undefined") {
		return defaultTheme;
	}

	try {
		const stored = window.localStorage.getItem(storageKey);
		if (stored === "light" || stored === "dark" || stored === "system") {
			return stored;
		}
	} catch {
		return defaultTheme;
	}

	return defaultTheme;
};

const applyResolvedTheme = (resolved: "dark" | "light") => {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.style.colorScheme = resolved;
};

export const ThemeProvider = ({
	children,
	defaultTheme = "system",
	storageKey = "theme",
}: ThemeProviderProps) => {
	const [theme, setTheme] = useState<Theme>(() =>
		readStoredTheme(storageKey, defaultTheme)
	);

	const updateTheme = useCallback(
		(next: Theme) => {
			try {
				window.localStorage.setItem(storageKey, next);
			} catch {
				// Ignore write errors (e.g. private browsing mode).
			}
			setTheme(next);
		},
		[storageKey]
	);

	useEffect(() => {
		applyResolvedTheme(resolveTheme(theme));
	}, [theme]);

	useEffect(() => {
		if (theme !== "system") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyResolvedTheme(resolveTheme("system"));
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme]);

	const value = useMemo(
		() => ({ theme, setTheme: updateTheme }),
		[theme, updateTheme]
	);

	return <ThemeProviderContext value={value}>{children}</ThemeProviderContext>;
};
