// oxlint-disable shadcn/no-inline-styles
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "cn";
import type { ReactNode } from "react";

interface SortableItemProps {
	id: string;
	children: (listeners: DraggableSyntheticListeners) => ReactNode;
	className?: string;
	data?: {
		type: "chapter" | "lesson";
		// Only relevant for lessons
		chapterId?: string;
	};
}

export const SortableItem = ({
	children,
	id,
	className,
	data,
}: SortableItemProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, data });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={cn("touch-none", className, isDragging ? "z-10" : "")}
		>
			{children(listeners)}
		</div>
	);
};
