import { TextAlign } from "@tiptap/extension-text-align";
import type { UseEditorOptions } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect } from "react";

import { Menubar } from "./menubar";

type StoredContent = NonNullable<UseEditorOptions["content"]>;

interface RichTextEditorField {
	name: string;
	state: { value: string };
	handleBlur: () => void;
	handleChange: (value: string) => void;
}

interface RichTextEditorProps {
	field: RichTextEditorField;
}

const parseStoredContent = (raw: string): StoredContent => {
	if (raw === "") {
		return "";
	}

	try {
		// SAFETY: JSON.parse returns `any`; Tiptap accepts parsed JSON as editor
		// content, and unparseable input falls through to the raw-string branch below.
		return JSON.parse(raw) as StoredContent;
	} catch {
		return raw;
	}
};

export const RichTextEditor = ({ field }: RichTextEditorProps) => {
	const fieldName = field.name;
	const fieldValue = field.state.value;

	const editor = useEditor({
		extensions: [
			StarterKit,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		],
		content: parseStoredContent(fieldValue),
		editorProps: {
			attributes: {
				id: fieldName,
				class:
					"min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
			},
		},
		immediatelyRender: false,
		onBlur: () => {
			field.handleBlur();
		},
		onUpdate: ({ editor: newEditor }) => {
			field.handleChange(
				newEditor.isEmpty ? "" : JSON.stringify(newEditor.getJSON())
			);
		},
	});

	useEffect(() => {
		if (editor === null || editor.isDestroyed || editor.isFocused) {
			return;
		}

		if (fieldValue !== JSON.stringify(editor.getJSON())) {
			editor.commands.setContent(parseStoredContent(fieldValue));
		}
	}, [editor, fieldValue]);

	return (
		<div className="border-input dark:bg-input/30 w-full overflow-hidden rounded-lg border">
			<Menubar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
};
