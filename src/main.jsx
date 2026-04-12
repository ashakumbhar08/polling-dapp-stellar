import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import { PollProvider } from './context/PollContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <PollProvider>
        <App />
      </PollProvider>
    </WalletProvider>
  </StrictMode>,
)
