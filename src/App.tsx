import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectButton } from '@mysten/dapp-kit';
import { chainIcons } from './assets/chains/index';
import styles from './App.module.css';

import { ChainSelect, type ChainOption } from './components/ChainSelect';
import { Navigation } from './components/Navigation';
import { StrategyPage } from './pages/StrategyPage';
import { PortfolioPage } from './pages/PortfolioPage';

type HeaderChainId = 'sui' | 'ethereum';

type EvmProvider = {
  isRabby?: boolean;
  request: (args: { method: string }) => Promise<string[]>;
};

declare global {
  interface Window {
    ethereum?: EvmProvider;
  }
}

function App() {
  const [activeChain, setActiveChain] = useState<HeaderChainId>('sui');
  const [evmAccount, setEvmAccount] = useState<string | null>(null);
  const [evmConnecting, setEvmConnecting] = useState(false);

  const chainOptions: ChainOption[] = [
    { id: 'sui', label: 'Sui', icon: chainIcons.sui },
    { id: 'ethereum', label: 'Ethereum', icon: chainIcons.ethereum },
  ];

  const handleEvmConnect = async () => {
    if (!window.ethereum) {
      window.alert('Rabby Wallet not detected.');
      return;
    }
    if (!window.ethereum.isRabby) {
      window.alert('Please use Rabby Wallet for EVM chains.');
      return;
    }
    try {
      setEvmConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setEvmAccount(accounts?.[0] ?? null);
    } catch (error) {
      console.warn('Failed to connect Rabby Wallet.', error);
    } finally {
      setEvmConnecting(false);
    }
  };

  const evmLabel = evmAccount
    ? `${evmAccount.slice(0, 6)}...${evmAccount.slice(-4)}`
    : 'Connect Wallet';

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.titleGroup}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 className={styles.title}>DeFi Dashboard</h1>
                <Navigation />
              </div>
            </div>
            <div className={styles.headerActions}>
              <ChainSelect
                options={chainOptions}
                value={activeChain}
                onChange={(id) => setActiveChain(id as HeaderChainId)}
              />
              {activeChain === 'sui' ? (
                <ConnectButton className={styles.connectButton} />
              ) : (
                <button
                  type="button"
                  className={styles.connectButton}
                  onClick={handleEvmConnect}
                  disabled={evmConnecting}
                >
                  {evmConnecting ? 'Connecting...' : evmLabel}
                </button>
              )}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/strategy" replace />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
