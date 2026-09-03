import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TWithChildren } from "@shared/lib/props";

// wagmi already requires react-query, so this is also what replaced swr for the
// chain list. One client for the app: rebuilding it on a chain switch would
// throw away the cache and refire every read.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryProvider = ({ children }: TWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
