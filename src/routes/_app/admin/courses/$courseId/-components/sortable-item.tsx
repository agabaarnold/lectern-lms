import { useSortable } from "@dnd-kit/react/sortable";
import type { UseSortableInput } from "@dnd-kit/react/sortable";
import { cn } from "cn";
import type { ReactNode } from "react";

type DragHandleRef = (element: Element | null) => void;

interface SortableItemProps {
	id: string;
	index: number;
	group?: string;
	type: "chapter" | "lesson";
	accept?: UseSortableInput["accept"];
	children: (handleRef: DragHandleRef) => ReactNode;
	className?: string;
}

export const SortableItem = ({
	children,
	id,
	index,
	group,
	type,
	accept,
	className,
}: SortableItemProps) => {
	const { ref, handleRef, isDragging } = useSortable({
		id,
		index,
		group,
		type,
		accept,
	});

	return (
		<div
			ref={ref}
			className={cn("touch-none", className, isDragging ? "z-10" : "")}
		>
			{children(handleRef)}
		</div>
	);
};
