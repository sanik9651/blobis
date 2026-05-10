import React, { useState } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useMining } from '../hooks/useMining';
import { useBalance } from '../hooks/useBalance';
import { useFirebase } from '../hooks/useFirebase';
import MiningInterface from './MiningInterface';
import CandlestickChart from './CandlestickChart';

const TradingTerminal = () => {
  const [activeTab, setActiveTab] = useState('MINING'); // MINING, TRADING, PROFILE
  const [tradeAmount, setTradeAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeError, setTradeError] = useState(null);

  const firebase = useFirebase();
  const balance = useBalance();
  const market = useMarket(firebase.user?.id);
  const mining = useMining(balance.addBC);

  if (!balance.isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <div className="text-white text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  const handleExecuteTrade = async () => {
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) return;

    // Check balance before trade
    if (isBuying) {
      if (balance.balanceBC < amount) {
        setTradeError('Insufficient BC balance');
        return;
      }
    } else {
      if (balance.balanceBLOB < amount) {
        setTradeError('Insufficient $BLOB balance');
        return;
      }
    }

    setIsTrading(true);
    setTradeError(null);

    try {
      // Execute trade through backend API
      const result = await market.executeMarketOrder(amount, isBuying, 5.0);

      if (result && result.success) {
        // Update local balances based on trade result from backend
        if (isBuying) {
          balance.deductBC(amount);
          balance.addBLOB(result.amount_out);
        } else {
          balance.deductBLOB(amount);
          balance.addBC(result.amount_out);
        }

        // Refresh balance from backend to ensure sync
        if (balance.refreshBalance) {
          await balance.refreshBalance();
        }

        setTradeAmount('');
        setTradeError(null);
      }
    } catch (error) {
      console.error('Trade error:', error);
      setTradeError(error.message || 'Trade failed. Please try again.');
    } finally {
      setIsTrading(false);
    }
  };

  const handlePurchaseUpgrade = (upgradeKey) => {
    const cost = mining.getUpgradeCost(upgradeKey);
    return mining.purchaseUpgrade(upgradeKey, balance.balanceBC, balance.deductBC);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  // Mining Tab
  if (activeTab === 'MINING') {
    return (
      <div className="relative min-h-screen bg-black">
        <MiningInterface
          balance={balance.balanceBC}
          clickPower={mining.clickPower}
          passiveIncome={mining.passiveIncome}
          onMine={mining.mine}
          upgrades={mining.upgrades}
          onPurchaseUpgrade={handlePurchaseUpgrade}
          getUpgradeCost={mining.getUpgradeCost}
          UPGRADES={mining.UPGRADES}
        />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-4 py-3 flex justify-around">
          <button
            onClick={() => setActiveTab('MINING')}
            className="flex flex-col items-center gap-1 text-yellow-400"
          >
            <div className="text-2xl">⛏️</div>
            <div className="text-xs font-semibold">Mine</div>
          </button>
          <button
            onClick={() => setActiveTab('TRADING')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <div className="text-2xl">📈</div>
            <div className="text-xs font-semibold">Trade</div>
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <div className="text-2xl">👤</div>
            <div className="text-xs font-semibold">Profile</div>
          </button>
        </div>
      </div>
    );
  }

  // Trading Tab
  if (activeTab === 'TRADING') {
    const preview = tradeAmount && parseFloat(tradeAmount) > 0
      ? market.calculateSlippage(parseFloat(tradeAmount), isBuying)
      : null;

    return (
      <div className="min-h-screen bg-black text-white pb-20">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-400 mb-1">BC/$BLOB Price</div>
            <div className="text-4xl font-bold text-yellow-400">
              {market.loading ? '...' : market.currentPrice.toFixed(2)}
            </div>
            {market.stats24h && (
              <div className={`text-sm mt-2 ${market.stats24h.change_percent_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {market.stats24h.change_percent_24h >= 0 ? '+' : ''}{market.stats24h.change_percent_24h.toFixed(2)}% (24h)
              </div>
            )}
          </div>

          {/* Balances */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <div className="text-xs text-gray-400 mb-1">BC Balance</div>
              <div className="text-2xl font-bold text-white">{formatNumber(balance.balanceBC)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <div className="text-xs text-gray-400 mb-1">$BLOB Balance</div>
              <div className="text-2xl font-bold text-yellow-400">{formatNumber(balance.balanceBLOB)}</div>
            </div>
          </div>

          {/* 24h Stats */}
          {market.stats24h && (
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <div className="text-gray-400">24h High</div>
                <div className="text-green-400 font-bold">{market.stats24h.high_24h.toFixed(2)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <div className="text-gray-400">24h Low</div>
                <div className="text-red-400 font-bold">{market.stats24h.low_24h.toFixed(2)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <div className="text-gray-400">24h Vol</div>
                <div className="text-white font-bold">{formatNumber(market.stats24h.volume_24h)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Trading Interface */}
        <div className="p-6">
          {/* Candlestick Chart */}
          {market.candles.length > 0 && (
            <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto">
              <div className="text-sm font-bold text-white mb-3">Price Chart</div>
              <CandlestickChart
                candles={market.candles}
                currentCandle={null}
                width={Math.min(window.innerWidth - 80, 600)}
                height={300}
              />
            </div>
          )}

          {/* Buy/Sell Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsBuying(true)}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                isBuying
                  ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              Buy $BLOB
            </button>
            <button
              onClick={() => setIsBuying(false)}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                !isBuying
                  ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              Sell $BLOB
            </button>
          </div>

          {/* Error Message */}
          {tradeError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
              {tradeError}
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">
              Amount ({isBuying ? 'BC' : '$BLOB'})
            </div>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              placeholder="0"
              disabled={isTrading}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 text-3xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 disabled:opacity-50"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Available: {isBuying ? formatNumber(balance.balanceBC) : formatNumber(balance.balanceBLOB)}</span>
              <button
                onClick={() => setTradeAmount(isBuying ? balance.balanceBC.toString() : balance.balanceBLOB.toString())}
                className="text-yellow-400 font-bold"
                disabled={isTrading}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">You receive:</span>
                <span className="font-bold text-white">{preview.amountOut.toFixed(4)} {isBuying ? '$BLOB' : 'BC'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price:</span>
                <span className="font-bold text-white">{preview.effectivePrice.toFixed(2)} BC</span>
              </div>
              {preview.slippage !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slippage:</span>
                  <span className={`font-bold ${Math.abs(preview.slippage) > 5 ? 'text-red-400' : 'text-white'}`}>
                    {preview.slippage.toFixed(2)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fee (0.3%):</span>
                <span className="font-bold text-white">{preview.fee.toFixed(4)}</span>
              </div>
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleExecuteTrade}
            disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || isTrading || market.loading}
            className={`w-full py-5 rounded-xl font-bold text-xl shadow-lg transition-all ${
              tradeAmount && parseFloat(tradeAmount) > 0 && !isTrading && !market.loading
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-white/10 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isTrading ? 'Processing...' : isBuying ? 'Buy $BLOB' : 'Sell $BLOB'}
          </button>

          {/* Recent Trades */}
          <div className="mt-8">
            <div className="text-lg font-bold mb-4 text-white">Recent Trades</div>
            <div className="space-y-2">
              {market.trades.slice(0, 5).map((trade, i) => (
                <div key={trade.id || i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className={`font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.type}
                    </div>
                    <div className="text-xs text-gray-400">
                      {trade.timestamp ? new Date(trade.timestamp.seconds * 1000).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{trade.price?.toFixed(2) || '0.00'} BC</div>
                    <div className="text-xs text-gray-400">{trade.amountOut?.toFixed(4) || '0.0000'} $BLOB</div>
                  </div>
                </div>
              ))}
              {market.trades.length === 0 && (
                <div className="text-center text-gray-400 py-8">No recent trades</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-4 py-3 flex justify-around">
          <button
            onClick={() => setActiveTab('MINING')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <div className="text-2xl">⛏️</div>
            <div className="text-xs font-semibold">Mine</div>
          </button>
          <button
            onClick={() => setActiveTab('TRADING')}
            className="flex flex-col items-center gap-1 text-yellow-400"
          >
            <div className="text-2xl">📈</div>
            <div className="text-xs font-semibold">Trade</div>
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <div className="text-2xl">👤</div>
            <div className="text-xs font-semibold">Profile</div>
          </button>
        </div>
      </div>
    );
  }

  // Profile Tab
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="p-6">
        {/* User Info Header */}
        <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl">
              {firebase.user?.firstName?.[0] || '👤'}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {firebase.user?.firstName} {firebase.user?.lastName}
              </div>
              <div className="text-sm text-gray-400">
                @{firebase.user?.username}
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                ID: {firebase.user?.id}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-yellow-400">Balances</h2>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Balance</div>
            <div className="text-3xl font-bold text-white">{formatNumber(balance.balanceBC)} BC</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">$BLOB Holdings</div>
            <div className="text-3xl font-bold text-yellow-400">{formatNumber(balance.balanceBLOB)} $BLOB</div>
            {balance.balanceBLOB > 0 && market.currentPrice > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                ≈ {formatNumber(balance.balanceBLOB * market.currentPrice)} BC
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
            <div className="text-3xl font-bold text-green-400">
              {formatNumber(balance.balanceBC + (balance.balanceBLOB * market.currentPrice))} BC
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 mt-6 text-yellow-400">Mining Stats</h2>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Mined</div>
            <div className="text-3xl font-bold text-white">{formatNumber(mining.totalMined)} BC</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-2">Current Stats</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Click Power:</span>
                <span className="text-white font-semibold">{mining.clickPower.toFixed(1)} BC/tap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Passive Income:</span>
                <span className="text-white font-semibold">{mining.passiveIncome.toFixed(1)} BC/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        {market.stats24h && (
          <>
            <h2 className="text-xl font-bold mb-4 mt-6 text-yellow-400">Market Stats (24h)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Volume</div>
                <div className="text-lg font-bold text-white">{formatNumber(market.stats24h.volume_24h)}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Trades</div>
                <div className="text-lg font-bold text-white">{market.stats24h.trades_24h}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">High</div>
                <div className="text-lg font-bold text-green-400">{market.stats24h.high_24h.toFixed(2)}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Low</div>
                <div className="text-lg font-bold text-red-400">{market.stats24h.low_24h.toFixed(2)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-4 py-3 flex justify-around">
        <button
          onClick={() => setActiveTab('MINING')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          <div className="text-2xl">⛏️</div>
          <div className="text-xs font-semibold">Mine</div>
        </button>
        <button
          onClick={() => setActiveTab('TRADING')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          <div className="text-2xl">📈</div>
          <div className="text-xs font-semibold">Trade</div>
        </button>
        <button
          onClick={() => setActiveTab('PROFILE')}
          className="flex flex-col items-center gap-1 text-yellow-400"
        >
          <div className="text-2xl">👤</div>
          <div className="text-xs font-semibold">Profile</div>
        </button>
      </div>
    </div>
  );
};

export default TradingTerminal;
