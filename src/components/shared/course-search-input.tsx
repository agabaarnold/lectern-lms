import { IconSearch } from "@tabler/icons-react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "#/components/ui/input-group.tsx";

interface CourseSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	id?: string;
}

export const CourseSearchInput = ({
	value,
	onChange,
	placeholder = "Search courses...",
	id = "course-search",
}: CourseSearchInputProps) => (
	<div className="w-full max-w-sm">
		<label className="sr-only" htmlFor={id}>
			Search courses
		</label>

		<InputGroup>
			<InputGroupAddon>
				<IconSearch />
			</InputGroupAddon>

			<InputGroupInput
				id={id}
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
			/>
		</InputGroup>
	</div>
);
