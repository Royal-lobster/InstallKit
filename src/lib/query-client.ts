import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: FIVE_MINUTES,
			gcTime: THIRTY_MINUTES,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});
