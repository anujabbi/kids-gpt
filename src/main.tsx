import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializePostHog } from './services/posthogService'

// Initialize PostHog
initializePostHog();

createRoot(document.getElementById("root")!).render(<App />);
