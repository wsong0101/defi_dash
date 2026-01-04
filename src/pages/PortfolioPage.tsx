import { useState } from 'react';
import { categories } from '../config/categories';
import type { ArbitrageCategoryId } from '../domain/types';
import { Tabs } from '../components/Tabs';
import { Modal } from '../components/Modal';
import { LoopingStrategy } from '../components/LoopingStrategy';
import styles from './PortfolioPage.module.css';
import appStyles from '../App.module.css';
import { formatNumber, formatPercent } from '../utils/format';

export function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<ArbitrageCategoryId>('lending');
  // Use selectedPosition to manage modal state
  // null = closed, object = open
  const [selectedPosition, setSelectedPosition] = useState<{
    token: string;
    supplyApy?: number;
    borrowApy?: number;
    maxLtv: number;
  } | null>(null);

  const tabItems = categories.map((category) => ({
    id: category.id,
    label: category.label,
    disabled: false,
  }));

  // Mock Assets Data with Prices and Liquidation Thresholds
  const supplyAssets = [
    {
      symbol: 'USDT',
      name: 'Tether USD',
      amount: 3253.56,
      price: 1.0,
      apy: 0.12,
      collateral: true,
      maxLtv: 0.75,
      lt: 0.8,
    },
    {
      symbol: 'USDC',
      name: 'USDC',
      amount: 1267.4,
      price: 1.0,
      apy: 0.14,
      collateral: true,
      maxLtv: 0.8,
      lt: 0.85,
    },
    {
      symbol: 'SUI',
      name: 'Sui',
      amount: 2500.0,
      price: 1.68,
      apy: 0.08,
      collateral: true,
      maxLtv: 0.6,
      lt: 0.65,
    },
    {
      symbol: 'vSUI',
      name: 'Volo Staked SUI',
      amount: 1000.0,
      price: 1.85,
      apy: 0.05,
      collateral: true,
      maxLtv: 0.5,
      lt: 0.6,
    },
  ];

  const borrowAssets = [
    {
      symbol: 'wETH',
      name: 'Wrapped Ether',
      amount: 0.2,
      price: 3200.0,
      value: 640.0,
      apy: 0.02,
      maxLtv: 0.75,
    },
    { symbol: 'SUI', name: 'Sui', amount: 500, price: 1.68, value: 840.0, apy: 0.12, maxLtv: 0.6 },
  ];

  // Calculate Totals based on assets
  const totalCollateral = supplyAssets.reduce((acc, asset) => acc + asset.amount * asset.price, 0);
  const totalBorrow = borrowAssets.reduce((acc, asset) => acc + asset.amount * asset.price, 0);
  const netApy = 0.048;

  // Calculate Global Liquidation Power (Threshold Weighted Value)
  const totalLiquidationPower = supplyAssets.reduce((acc, asset) => {
    if (!asset.collateral) return acc;
    return acc + asset.amount * asset.price * asset.lt;
  }, 0);

  // Recalculate Health Factor based on new assets data
  // HF = Total Liquidation Power / Total Borrow
  const calculatedHealthFactor = totalBorrow > 0 ? totalLiquidationPower / totalBorrow : Infinity;

  // Calculate Risk %
  const riskPercentage = Math.min(
    Math.max(totalBorrow > 0 ? (1 / calculatedHealthFactor) * 100 : 0, 0),
    100
  );

  // Helper to calculate Liq Price for a specific asset
  const getAssetLiqPrice = (asset: (typeof supplyAssets)[0]) => {
    if (!asset.collateral) return null; // Not collateral, no risk contribution

    // Power from OTHER assets
    const otherPower = totalLiquidationPower - asset.amount * asset.price * asset.lt;

    // Equation: TotalBorrow = OtherPower + (AssetAmount * LiqPrice * LT)
    // AssetAmount * LiqPrice * LT = TotalBorrow - OtherPower
    const requiredValue = totalBorrow - otherPower;

    if (requiredValue <= 0) return 0; // Safe even if price goes to 0

    return requiredValue / (asset.amount * asset.lt);
  };

  return (
    <>
      <Tabs
        tabs={tabItems}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as ArbitrageCategoryId)}
      />

      <main className={appStyles.content}>
        {activeTab === 'lending' && (
          <section className={styles.strategySection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Status</h2>
            </div>

            <div className={styles.statusArea}>
              <div className={styles.statusMain}>
                <div className={styles.metricsGroup}>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Net Value</span>
                    <span className={styles.metricValue}>
                      ${formatNumber(totalCollateral - totalBorrow)}
                    </span>
                  </div>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Net APY</span>
                    <span className={styles.metricValue}>{formatPercent(netApy * 100)}</span>
                  </div>
                  <div className={styles.healthBox}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'baseline',
                      }}
                    >
                      <span className={styles.metricLabel}>Health Factor</span>
                      <span className={styles.healthValue}>
                        {calculatedHealthFactor.toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.healthBar}>
                      {/* Gradient: Green (Low Risk) -> Red (High Risk) */}
                      <div
                        className={styles.healthIndicator}
                        style={{ left: `${riskPercentage}%` }}
                      />
                    </div>
                    <div className={styles.healthLabels}>
                      <span>Safe</span>
                      <span>Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
              <h2 className={styles.sectionTitle}>My Lending</h2>
            </div>

            <div className={styles.lendingTablesContainer}>
              {/* Supplies Panel */}
              <div className={styles.lendingPanel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Supplies</h3>
                  <div className={styles.headerStats}>
                    <div className={styles.statPill}>
                      <span className={styles.statLabel}>Balance</span>
                      <span className={styles.statValue}>${formatNumber(totalCollateral)}</span>
                    </div>
                    <div className={styles.statPill}>
                      <span className={styles.statLabel}>Collateral</span>
                      <span className={styles.statValue}>${formatNumber(totalCollateral)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.tableHeaderRow}>
                  <span style={{ flex: 1.5 }}>Asset</span>
                  <span style={{ flex: 1 }}>APY</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>Liq. Price</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>Collateral</span>
                  <span style={{ flex: 1.5, textAlign: 'right' }}>Actions</span>
                </div>

                <div className={styles.assetList}>
                  {supplyAssets.map((asset) => {
                    const liqPrice = getAssetLiqPrice(asset);
                    return (
                      <div key={asset.symbol} className={styles.assetRow}>
                        <div className={styles.assetInfo} style={{ flex: 1.5 }}>
                          <div className={styles.tokenIconPlaceholder}>{asset.symbol[0]}</div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className={styles.assetAmount}>{formatNumber(asset.amount)}</span>
                            <span className={styles.assetSymbol}>{asset.symbol}</span>
                          </div>
                        </div>
                        <div className={styles.assetApy} style={{ flex: 1 }}>
                          {formatPercent(asset.apy * 100)}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            color: '#ff4444',
                          }}
                        >
                          {liqPrice === null
                            ? '-'
                            : liqPrice === 0
                              ? 'Safe'
                              : `$${formatNumber(liqPrice)}`}
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                          <label className={styles.toggleSwitch} aria-label="Toggle Collateral">
                            <input type="checkbox" checked={asset.collateral} readOnly />
                            <span className={styles.toggleSlider} />
                          </label>
                        </div>
                        <div className={styles.assetActions} style={{ flex: 1.5 }}>
                          <button
                            className={styles.actionBtnPrimary}
                            onClick={() =>
                              setSelectedPosition({
                                token: asset.symbol,
                                supplyApy: asset.apy,
                                maxLtv: asset.maxLtv,
                              })
                            }
                          >
                            Deposit
                          </button>
                          <button className={styles.actionBtnSecondary}>Withdraw</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Borrows Panel */}
              <div className={styles.lendingPanel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Borrows</h3>
                  <div className={styles.headerStats}>
                    <div className={styles.statPill}>
                      <span className={styles.statLabel}>Balance</span>
                      <span className={styles.statValue}>${formatNumber(totalBorrow)}</span>
                    </div>
                    <div className={styles.statPill}>
                      <span className={styles.statLabel}>Power used</span>
                      <span className={styles.statValue}>
                        {(calculatedHealthFactor > 0
                          ? (1 / calculatedHealthFactor) * 100
                          : 0
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.tableHeaderRow}>
                  <span style={{ flex: 1.5 }}>Asset</span>
                  <span style={{ flex: 1 }}>APY</span>
                  <span style={{ flex: 1.5, textAlign: 'right' }}>Actions</span>
                </div>

                <div className={styles.assetList}>
                  {borrowAssets.map((asset) => (
                    <div key={asset.symbol} className={styles.assetRow}>
                      <div className={styles.assetInfo} style={{ flex: 1.5 }}>
                        <div
                          className={styles.tokenIconPlaceholder}
                          style={{ background: '#f7931a', color: '#fff' }}
                        >
                          {asset.symbol[0]}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles.assetAmount}>
                            {asset.amount} {asset.symbol}
                          </span>
                          <span className={styles.assetSymbol}>${formatNumber(asset.value)}</span>
                        </div>
                      </div>
                      <div className={styles.assetApy} style={{ flex: 1 }}>
                        &lt;{formatPercent(asset.apy * 100)}
                      </div>
                      <div className={styles.assetActions} style={{ flex: 1.5 }}>
                        <button
                          className={styles.actionBtnOutline}
                          onClick={() =>
                            setSelectedPosition({
                              token: asset.symbol,
                              borrowApy: asset.apy,
                              maxLtv: asset.maxLtv,
                            })
                          }
                        >
                          Borrow
                        </button>
                        <button className={styles.actionBtnSecondary}>Repay</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ... LST and Liquidity sections (unchanged) ... */}
        {activeTab === 'lst' && (
          <section className={styles.strategySection}>
            {/* ... existing LST content ... */}
            <div className={styles.comingSoonOverlay}>
              <span className={styles.comingSoonBadge}>LST Portfolio • Coming Soon</span>
            </div>
            <div className={styles.blurredSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>LST Portfolio</h2>
              </div>
              <div className={styles.summaryGrid}>
                <div className={styles.card}>
                  <span className={styles.cardLabel}>Total Staked</span>
                  <span className={styles.cardValue}>$0.00</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'liquidity' && (
          <section className={styles.strategySection}>
            {/* ... existing Liquidity content ... */}
            <div className={styles.comingSoonOverlay}>
              <span className={styles.comingSoonBadge}>Liquidity Portfolio • Coming Soon</span>
            </div>
            <div className={styles.blurredSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Liquidity Portfolio</h2>
              </div>
              <div className={styles.summaryGrid}>
                <div className={styles.card}>
                  <span className={styles.cardLabel}>TVL</span>
                  <span className={styles.cardValue}>$0.00</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {selectedPosition && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPosition(null)}
          title={`Manage Strategy: ${selectedPosition.token}`}
        >
          <LoopingStrategy
            token={selectedPosition.token}
            supplyApy={selectedPosition.supplyApy}
            borrowApy={selectedPosition.borrowApy}
            maxLtv={selectedPosition.maxLtv}
            // Passing initial leverage based on mock data if needed
          />
        </Modal>
      )}
    </>
  );
}
