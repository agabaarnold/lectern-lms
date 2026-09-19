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
import { cn } from "cn";

import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface MenubarProps {
	editor: Editor | null;
}

export const Menubar = ({ editor }: MenubarProps) => {
	if (!editor) {
		return null;
	}

	return (
		<div className="border-input bg-card flex flex-wrap items-center gap-1 rounded-t-lg border border-x-0 border-t-0 p-2">
			{/* Icons with tooltip */}
			<div className="flex flex-wrap gap-1">
				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("bold") && "bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleBold().run()
								}
								pressed={editor.isActive("bold")}
								size="sm"
							>
								<IconBold />
							</Toggle>
						}
					/>

					<TooltipContent>Bold</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("italic") && "bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleItalic().run()
								}
								pressed={editor.isActive("italic")}
								size="sm"
							>
								<IconItalic />
							</Toggle>
						}
					/>

					<TooltipContent>Italic</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("strike") && "bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleStrike().run()
								}
								pressed={editor.isActive("strike")}
								size="sm"
							>
								<IconStrikethrough />
							</Toggle>
						}
					/>

					<TooltipContent>Strikethrough</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("heading", { level: 1 }) &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 1 }).run()
								}
								pressed={editor.isActive("heading", { level: 1 })}
								size="sm"
							>
								<IconH1 />
							</Toggle>
						}
					/>

					<TooltipContent>Heading 1</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("heading", { level: 2 }) &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 2 }).run()
								}
								pressed={editor.isActive("heading", { level: 2 })}
								size="sm"
							>
								<IconH2 />
							</Toggle>
						}
					/>

					<TooltipContent>Heading 2</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("heading", { level: 3 }) &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 3 }).run()
								}
								pressed={editor.isActive("heading", { level: 3 })}
								size="sm"
							>
								<IconH3 />
							</Toggle>
						}
					/>

					<TooltipContent>Heading 3</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("bulletList") &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleBulletList().run()
								}
								pressed={editor.isActive("bulletList")}
								size="sm"
							>
								<IconList />
							</Toggle>
						}
					/>

					<TooltipContent>Bullet List</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive("orderedList") &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().toggleOrderedList().run()
								}
								pressed={editor.isActive({ textAlign: "left" })}
								size="sm"
							>
								<IconListNumbers />
							</Toggle>
						}
					/>

					<TooltipContent>Ordered List</TooltipContent>
				</Tooltip>
			</div>

			<div className="bg-border mx-2 h-6 w-px" />

			<div className="flex flex-wrap gap-1">
				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive({ textAlign: "left" }) &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().setTextAlign("left").run()
								}
								pressed={editor.isActive({ textAlign: "left" })}
								size="sm"
							>
								<IconAlignLeft />
							</Toggle>
						}
					/>

					<TooltipContent>Align Left</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive({ textAlign: "center" }) &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().setTextAlign("center").run()
								}
								pressed={editor.isActive({ textAlign: "center" })}
								size="sm"
							>
								<IconAlignCenter />
							</Toggle>
						}
					/>

					<TooltipContent>Align Center</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Toggle
								className={cn(
									editor.isActive({ textAlign: "right" }) &&
										"bg-muted text-muted-foreground"
								)}
								onPressedChange={() =>
									editor.chain().focus().setTextAlign("right").run()
								}
								pressed={editor.isActive({ textAlign: "right" })}
								size="sm"
							>
								<IconAlignRight />
							</Toggle>
						}
					/>

					<TooltipContent>Align Right</TooltipContent>
				</Tooltip>
			</div>

			<div className="bg-border mx-2 h-6 w-px" />

			<div className="flex flex-wrap gap-1">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								disabled={!editor.can().undo()}
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
								disabled={!editor.can().redo()}
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
