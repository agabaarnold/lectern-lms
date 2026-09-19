// oxlint-disable shadcn/no-restyle
import {
	IconAlignCenter,
	IconAlignLeft,
	IconAlignRight,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconBold,
	IconH1,
	IconH2,
	IconH3,
	IconItalic,
	IconList,
	IconListNumbers,
	IconStrikethrough,
} from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { cn } from "cn";
import type { ReactNode } from "react";

import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface MenubarProps {
	editor: Editor | null;
}

interface FormatToggleDef {
	tooltip: string;
	icon: ReactNode;
	pressed: boolean;
	onPressedChange: () => void;
}

const ACTIVE_TOGGLE_CLASS_NAME = "bg-muted text-muted-foreground";

const FormatToggle = ({
	tooltip,
	icon,
	pressed,
	onPressedChange,
}: FormatToggleDef) => (
	<Tooltip>
		<TooltipTrigger
			render={
				<Toggle
					className={cn(pressed && ACTIVE_TOGGLE_CLASS_NAME)}
					onPressedChange={onPressedChange}
					pressed={pressed}
					size="sm"
				>
					{icon}
				</Toggle>
			}
		/>

		<TooltipContent>{tooltip}</TooltipContent>
	</Tooltip>
);

const MenubarContent = ({ editor }: { editor: Editor }) => {
	const toolbarState = useEditorState({
		editor,
		selector: (ctx) => ({
			alignCenter: ctx.editor.isActive({ textAlign: "center" }),
			alignLeft: ctx.editor.isActive({ textAlign: "left" }),
			alignRight: ctx.editor.isActive({ textAlign: "right" }),
			bold: ctx.editor.isActive("bold"),
			bulletList: ctx.editor.isActive("bulletList"),
			canRedo: ctx.editor.can().redo(),
			canUndo: ctx.editor.can().undo(),
			heading1: ctx.editor.isActive("heading", { level: 1 }),
			heading2: ctx.editor.isActive("heading", { level: 2 }),
			heading3: ctx.editor.isActive("heading", { level: 3 }),
			italic: ctx.editor.isActive("italic"),
			orderedList: ctx.editor.isActive("orderedList"),
			strike: ctx.editor.isActive("strike"),
		}),
	});

	if (!toolbarState) {
		return null;
	}

	const markToggles: FormatToggleDef[] = [
		{
			tooltip: "Bold",
			icon: <IconBold />,
			pressed: toolbarState.bold,
			onPressedChange: () => editor.chain().focus().toggleBold().run(),
		},
		{
			tooltip: "Italic",
			icon: <IconItalic />,
			pressed: toolbarState.italic,
			onPressedChange: () => editor.chain().focus().toggleItalic().run(),
		},
		{
			tooltip: "Strikethrough",
			icon: <IconStrikethrough />,
			pressed: toolbarState.strike,
			onPressedChange: () => editor.chain().focus().toggleStrike().run(),
		},
		{
			tooltip: "Heading 1",
			icon: <IconH1 />,
			pressed: toolbarState.heading1,
			onPressedChange: () =>
				editor.chain().focus().toggleHeading({ level: 1 }).run(),
		},
		{
			tooltip: "Heading 2",
			icon: <IconH2 />,
			pressed: toolbarState.heading2,
			onPressedChange: () =>
				editor.chain().focus().toggleHeading({ level: 2 }).run(),
		},
		{
			tooltip: "Heading 3",
			icon: <IconH3 />,
			pressed: toolbarState.heading3,
			onPressedChange: () =>
				editor.chain().focus().toggleHeading({ level: 3 }).run(),
		},
		{
			tooltip: "Bullet List",
			icon: <IconList />,
			pressed: toolbarState.bulletList,
			onPressedChange: () => editor.chain().focus().toggleBulletList().run(),
		},
		{
			tooltip: "Ordered List",
			icon: <IconListNumbers />,
			pressed: toolbarState.orderedList,
			onPressedChange: () => editor.chain().focus().toggleOrderedList().run(),
		},
	];

	const alignToggles: FormatToggleDef[] = [
		{
			tooltip: "Align Left",
			icon: <IconAlignLeft />,
			pressed: toolbarState.alignLeft,
			onPressedChange: () => editor.chain().focus().setTextAlign("left").run(),
		},
		{
			tooltip: "Align Center",
			icon: <IconAlignCenter />,
			pressed: toolbarState.alignCenter,
			onPressedChange: () =>
				editor.chain().focus().setTextAlign("center").run(),
		},
		{
			tooltip: "Align Right",
			icon: <IconAlignRight />,
			pressed: toolbarState.alignRight,
			onPressedChange: () => editor.chain().focus().setTextAlign("right").run(),
		},
	];

	return (
		<div className="border-input bg-card flex flex-wrap items-center gap-1 rounded-t-lg border border-x-0 border-t-0 p-2">
			{/* Icons with tooltip */}
			<div className="flex flex-wrap gap-1">
				{markToggles.map((toggle) => (
					<FormatToggle key={toggle.tooltip} {...toggle} />
				))}
			</div>

			<div className="bg-border mx-2 h-6 w-px" />

			<div className="flex flex-wrap gap-1">
				{alignToggles.map((toggle) => (
					<FormatToggle key={toggle.tooltip} {...toggle} />
				))}
			</div>

			<div className="bg-border mx-2 h-6 w-px" />

			<div className="flex flex-wrap gap-1">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								disabled={!toolbarState.canUndo}
								onClick={() => editor.chain().focus().undo().run()}
								variant="ghost"
								type="button"
								size="sm"
							>
								<IconArrowBackUp />
							</Button>
						}
					/>

					<TooltipContent>Undo</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								disabled={!toolbarState.canRedo}
								onClick={() => editor.chain().focus().redo().run()}
								variant="ghost"
								type="button"
								size="sm"
							>
								<IconArrowForwardUp />
							</Button>
						}
					/>

					<TooltipContent>Redo</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
};

export const Menubar = ({ editor }: MenubarProps) => {
	if (!editor) {
		return null;
	}

	return <MenubarContent editor={editor} />;
};
