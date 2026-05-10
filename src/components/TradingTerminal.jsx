import React, { useState } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useMining } from '../hooks/useMining';
import { useBalance } from '../hooks/useBalance';
import MiningInterface from './MiningInterface';

const TradingTerminal = () => {
  const [activeTab, setActiveTab] = useState('MINING'); // MINING, TRADING, PROFILE
  const [tradeAmount, setTradeAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);

  const balance = useBalance();
  const market = useMarket();
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

  const handleExecuteTrade = () => {
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) return;

    if (isBuying) {
      if (!balance.deductBC(amount)) {
        alert('Insufficient BC balance');
        return;
      }
    } else {
      if (!balance.deductBLOB(amount)) {
        alert('Insufficient $BLOB balance');
        return;
      }
    }

    const result = market.executeMarketOrder(amount, isBuying);

    if (result) {
      if (isBuying) {
        balance.addBLOB(result.amountOut);
      } else {
        balance.addBC(result.amountOut);
      }
      setTradeAmount('');
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
            <div className="text-4xl font-bold text-yellow-400">{market.currentPrice.toFixed(2)}</div>
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
        </div>

        {/* Trading Interface */}
        <div className="p-6">
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
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 text-3xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Available: {isBuying ? formatNumber(balance.balanceBC) : formatNumber(balance.balanceBLOB)}</span>
              <button
                onClick={() => setTradeAmount(isBuying ? balance.balanceBC.toString() : balance.balanceBLOB.toString())}
                className="text-yellow-400 font-bold"
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
            disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
            className={`w-full py-5 rounded-xl font-bold text-xl shadow-lg transition-all ${
              tradeAmount && parseFloat(tradeAmount) > 0
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-white/10 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isBuying ? 'Buy $BLOB' : 'Sell $BLOB'}
          </button>

          {/* Recent Trades */}
          <div className="mt-8">
            <div className="text-lg font-bold mb-4 text-white">Recent Trades</div>
            <div className="space-y-2">
              {market.trades.slice(0, 5).map((trade, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className={`font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.type}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{trade.price.toFixed(2)} BC</div>
                    <div className="text-xs text-gray-400">{trade.amount.toFixed(4)} $BLOB</div>
                  </div>
                </div>
              ))}
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
        <h1 className="text-3xl font-bold mb-6 text-yellow-400">Profile</h1>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Balance</div>
            <div className="text-3xl font-bold text-white">{formatNumber(balance.balanceBC)} BC</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">$BLOB Holdings</div>
            <div className="text-3xl font-bold text-yellow-400">{formatNumber(balance.balanceBLOB)} $BLOB</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Mined</div>
            <div className="text-3xl font-bold text-white">{formatNumber(mining.totalMined)} BC</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-2">Mining Stats</div>
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
