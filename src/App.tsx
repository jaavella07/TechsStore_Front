import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/router'
import { ToastContainer } from '@/components/ui/Toast'
import { ChatWidget } from '@/components/layout/ChatWidget'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,
      retry: 1,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
        <ChatWidget />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
