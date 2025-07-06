import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes'
import { BrowserRouter} from 'react-router-dom'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// console.log("Clerk publishable key:", import.meta.env);
if (!clerkKey) {
  throw new Error("Clerk publishable key is not defined.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ClerkProvider appearance={{
      baseTheme: [dark],
    }} publishableKey={clerkKey} >
      <App />
    </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
