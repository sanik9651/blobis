import React, { useState } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useMining } from '../hooks/useMining';
import { useBalance } from '../hooks/useBalance';
import MiningInterface from './MiningInterface';

const TradingTerminal = () => {
  const [activeTab, setActiveTab] = useState('MINING'); // MINING or TRADING
  const [tradeAmount, setTradeAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);

  const balance = useBalance();
  const market = useMarket();
  const mining = useMining(balance.addBC);

  if (!balance.isLoaded) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
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

  if (activeTab === 'MINING') {
    return (
      <div className="relative">
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

        {/* Tab Switcher */}
        <button
          onClick={() => setActiveTab('TRADING')}
          className="fixed top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold z-50"
        >
          📈 Trade
        </button>
      </div>
    );
  }

  // Trading View (NotCoin style - simplified)
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const preview = tradeAmount && parseFloat(tradeAmount) > 0
    ? market.calculateSlippage(parseFloat(tradeAmount), isBuying)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
      {/* Header */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setActiveTab('MINING')}
            className="text-2xl"
          >
            ← Back
          </button>
          <div className="text-center">
            <div className="text-sm opacity-70">BC/$BLOB Price</div>
            <div className="text-2xl font-bold">{market.currentPrice.toFixed(2)}</div>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-sm opacity-70">BC Balance</div>
            <div className="text-2xl font-bold">{formatNumber(balance.balanceBC)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-sm opacity-70">$BLOB Balance</div>
            <div className="text-2xl font-bold">{formatNumber(balance.balanceBLOB)}</div>
          </div>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsBuying(true)}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
              isBuying
                ? 'bg-white text-green-600 shadow-lg'
                : 'bg-white/10 backdrop-blur-sm'
            }`}
          >
            Buy $BLOB
          </button>
          <button
            onClick={() => setIsBuying(false)}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
              !isBuying
                ? 'bg-white text-green-600 shadow-lg'
                : 'bg-white/10 backdrop-blur-sm'
            }`}
          >
            Sell $BLOB
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="text-sm opacity-70 mb-2">
            Amount ({isBuying ? 'BC' : '$BLOB'})
          </div>
          <input
            type="number"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-6 py-4 text-2xl font-bold text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
          <div className="flex justify-between mt-2 text-sm opacity-70">
            <span>Available: {isBuying ? formatNumber(balance.balanceBC) : formatNumber(balance.balanceBLOB)}</span>
            <button
              onClick={() => setTradeAmount(isBuying ? balance.balanceBC.toString() : balance.balanceBLOB.toString())}
              className="text-white font-bold"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="opacity-70">You receive:</span>
              <span className="font-bold">{preview.amountOut.toFixed(4)} {isBuying ? '$BLOB' : 'BC'}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Price:</span>
              <span className="font-bold">{preview.effectivePrice.toFixed(2)} BC</span>
            </div>
            {preview.slippage !== undefined && (
              <div className="flex justify-between">
                <span className="opacity-70">Slippage:</span>
                <span className={`font-bold ${Math.abs(preview.slippage) > 5 ? 'text-red-300' : ''}`}>
                  {preview.slippage.toFixed(2)}%
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="opacity-70">Fee (0.3%):</span>
              <span className="font-bold">{preview.fee.toFixed(4)}</span>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <button
          onClick={handleExecuteTrade}
          disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
          className={`w-full py-6 rounded-2xl font-bold text-xl shadow-lg transition-all ${
            tradeAmount && parseFloat(tradeAmount) > 0
              ? 'bg-white text-green-600'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
        >
          {isBuying ? 'Buy $BLOB' : 'Sell $BLOB'}
        </button>

        {/* Recent Trades */}
        <div className="mt-8">
          <div className="text-lg font-bold mb-4">Recent Trades</div>
          <div className="space-y-2">
            {market.trades.slice(0, 5).map((trade, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center">
                <div>
                  <div className={`font-bold ${trade.type === 'BUY' ? 'text-green-300' : 'text-red-300'}`}>
                    {trade.type}
                  </div>
                  <div className="text-sm opacity-70">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{trade.price.toFixed(2)} BC</div>
                  <div className="text-sm opacity-70">{trade.amount.toFixed(4)} $BLOB</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingTerminal;
