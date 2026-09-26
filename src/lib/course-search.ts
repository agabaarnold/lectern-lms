interface SearchableCourse {
	title: string;
	smallDescription?: string | null;
	category?: string | null;
}

export const matchesCourseQuery = (
	course: SearchableCourse,
	query: string
): boolean => {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return true;
	}

	return [course.title, course.smallDescription, course.category]
		.filter((field): field is string => typeof field === "string")
		.some((field) => field.toLowerCase().includes(normalizedQuery));
};
