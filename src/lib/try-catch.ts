// Types for the result object with discriminated union
interface Success<T> {
	data: T;
	error: null;
}

interface Failure<E> {
	data: null;
	error: E;
}

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export const tryCatch = async <T, E = Error>(
	promise: Promise<T>
): Promise<Result<T, E>> => {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		// SAFETY: caught values are `unknown`; callers opt into the error type
		// via `E`, and narrowing is impossible without constraining it.
		return { data: null, error: error as E };
	}
};
