import { createContext } from "react";

export type Theme = "dark" | "light" | "system";

export interface ThemeProviderState {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

export const ThemeProviderContext = createContext<
	ThemeProviderState | undefined
>(undefined);

export const resolveTheme = (theme: Theme): "dark" | "light" => {
	if (theme !== "system") {
		return theme;
	}
	if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		return "dark";
	}
	return "light";
};

export const getThemeScript = (storageKey: string, defaultTheme: Theme) => {
	const key = JSON.stringify(storageKey);
	const fallback = JSON.stringify(defaultTheme);

	return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`;
};
