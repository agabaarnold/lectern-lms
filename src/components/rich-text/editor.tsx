import { TextAlign } from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { Menubar } from "./menubar";

export const RichTextEditor = () => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		],
		editorProps: {
			attributes: {
				class:
					"min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
			},
		},
		immediatelyRender: false,
	});

	return (
		<div className="border-input dark:bg-input/30 w-full overflow-hidden rounded-lg border">
			<Menubar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
};
