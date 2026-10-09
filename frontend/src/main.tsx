import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import './index.scss'
import App from './App.tsx'

const queryClient = new QueryClient();

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'niche-item-finder-cache',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60,
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return query.queryKey[0] === 'recommendedItems' && query.state.status === 'success';
          },
        },
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)

