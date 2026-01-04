import { useEffect, useMemo, useState } from 'react';
import styles from './LoopingStrategy.module.css';
import { formatPercent } from '../utils/format';
import type { ChainId } from '../domain/types';
import { fetchWalletBalance, getLoopingMetrics } from '../integrations/looping';

interface LoopingStrategyProps {
  token: string;
  supplyApy: number;
  borrowApy: number;
  maxLtv: number;
  chain?: ChainId;
}

type TabId = 'deposit' | 'unwind' | 'adjust';

export function LoopingStrategy({
  token,
  supplyApy,
  borrowApy,
  maxLtv,
  chain,
}: LoopingStrategyProps) {
  const depositAmountId = 'deposit-amount';
  const unwindAmountId = 'unwind-amount';
  const leverageSliderId = 'leverage-slider';
  const adjustSliderId = 'adjust-slider';
  const [activeTab, setActiveTab] = useState<TabId>('deposit');
  const [amount, setAmount] = useState<string>('1');
  const [leverage, setLeverage] = useState<number>(1.0);
  const [walletBalance, setWalletBalance] = useState<string>('0');

  useEffect(() => {
    let mounted = true;
    fetchWalletBalance({ chain, token }).then((balance) => {
      if (mounted) setWalletBalance(balance);
    });
    return () => {
      mounted = false;
    };
  }, [chain, token]);

  /* ... inside LoopingStrategy ... */
  const liquidationThreshold = 0.825; // Mock threshold (usually slightly higher than maxLtv)

  const { maxLeverage, netApy, healthFactor, liquidationPrice } = useMemo(() => {
    const metrics = getLoopingMetrics({ supplyApy, borrowApy, maxLtv, leverage });

    // Simple mock liquidation price calculation:
    // Liq Price = (Borrowed / (Collateral * LiqThreshold)) * CurrentPrice
    // Assuming CurrentPrice = 1 for now as we don't have it, so we return a ratio or just a mock value relative to 1.
    // Actually, let's just make it relative to the entry price (1.0).
    // If token price drops to X, collateral value drops.
    // Borrowed Value = Collateral Value * LiqThreshold
    // Borrowed = (Collateral * Price) * LiqThreshold
    // Price = Borrowed / (Collateral * LiqThreshold)

    // We need "Total Collateral" and "Total Borrow" based on leverage to do this right.
    // leverage = Collateral / Equity.
    // Let's assume Equity = 1 Unit.
    // Collateral = leverage.
    // Borrow = leverage - 1.
    // Liq Price = (leverage - 1) / (leverage * liquidationThreshold)

    const borrowed = leverage - 1;
    const coll = leverage;
    const liqPrice = borrowed / (coll * liquidationThreshold);

    return { ...metrics, liquidationPrice: liqPrice };
  }, [supplyApy, borrowApy, maxLtv, leverage]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeverage(parseFloat(e.target.value));
  };

  const setMaxBalance = () => {
    setAmount(walletBalance);
  };

  const getHealthColor = (hf: number) => {
    if (hf === Infinity) return styles.good;
    if (hf > 1.5) return styles.good;
    if (hf > 1.1) return styles.warning;
    return styles.danger;
  };

  const isHighRisk = healthFactor < 1.1 && healthFactor !== Infinity;

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'deposit' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'unwind' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('unwind')}
        >
          Unwind
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'adjust' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('adjust')}
        >
          Adjust
        </button>
      </div>

      {activeTab === 'deposit' && (
        <>
          <div className={styles.section}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor={depositAmountId}>
                Deposit Amount
              </label>
              <button type="button" className={styles.balanceLabel} onClick={setMaxBalance}>
                Max: {walletBalance} {token}
              </button>
            </div>
            <div className={styles.inputGroup}>
              <input
                id={depositAmountId}
                type="number"
                className={`${styles.input} ${parseFloat(amount) > parseFloat(walletBalance) ? styles.inputError : ''}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
              />
              <span className={styles.tokenSuffix}>{token}</span>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sliderHeader}>
              <label className={styles.label} htmlFor={leverageSliderId}>
                Leverage
              </label>
              <span className={styles.leverageValue}>{leverage.toFixed(1)}x</span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                id={leverageSliderId}
                type="range"
                min="1"
                max={maxLeverage * 0.95}
                step="0.1"
                value={leverage}
                onChange={handleSliderChange}
                className={styles.slider}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'unwind' && (
        <div className={styles.section}>
          <p className={styles.withdrawText}>
            Unwind your position and withdraw assets. This will repay your borrowed amount using the
            supplied collateral.
          </p>
          <div className={styles.inputGroup}>
            <label className={styles.srOnly} htmlFor={unwindAmountId}>
              Withdraw Amount
            </label>
            <input
              id={unwindAmountId}
              type="number"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to withdraw"
            />
            <span className={styles.tokenSuffix}>{token}</span>
          </div>
        </div>
      )}

      {activeTab === 'adjust' && (
        <div className={styles.section}>
          <div className={styles.sliderHeader}>
            <label className={styles.label} htmlFor={adjustSliderId}>
              Adjust Leverage
            </label>
            <span className={styles.leverageValue}>{leverage.toFixed(1)}x</span>
          </div>
          <div className={styles.sliderContainer}>
            <input
              id={adjustSliderId}
              type="range"
              min="1"
              max={maxLeverage * 0.95}
              step="0.1"
              value={leverage}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>
          <p className={styles.withdrawText} style={{ marginTop: '12px' }}>
            Adjusting leverage will automatically supply or withdraw assets to reach the target
            health factor.
          </p>
        </div>
      )}

      {isHighRisk && (
        <div className={styles.warningBox}>
          <span className={styles.warningIcon}>⚠️</span>
          <span>High Liquidation Risk! Monitor your position closely.</span>
        </div>
      )}

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Net APY</span>
          <span className={`${styles.metricValue} ${netApy >= 0 ? styles.good : styles.danger}`}>
            {formatPercent(netApy)}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Health Factor</span>
          <span className={`${styles.metricValue} ${getHealthColor(healthFactor)}`}>
            {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Liq. Price (est)</span>
          <span className={styles.metricValue}>
            {liquidationPrice > 0 ? `$${liquidationPrice.toFixed(4)}` : '-'}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.actionButton} ${isHighRisk ? styles.dangerButton : ''}`}
      >
        {activeTab === 'deposit' && 'Start Looping'}
        {activeTab === 'unwind' && 'Unwind & Withdraw'}
        {activeTab === 'adjust' && 'Update Position'}
      </button>
    </div>
  );
}
