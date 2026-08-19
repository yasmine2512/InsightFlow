import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(

  <BrowserRouter>
  <StrictMode>
    <AuthProvider>
    <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
  </BrowserRouter>
)
