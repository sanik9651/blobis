import React, { useState } from 'react';

const TradingPanel = ({
  currentPrice,
  balance,
  onExecuteTrade,
  onPlaceLimitOrder,
  calculateSlippage
}) => {
  const [orderType, setOrderType] = useState('MARKET'); // MARKET or LIMIT
  const [side, setSide] = useState('BUY'); // BUY or SELL
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const isBuy = side === 'BUY';
  const isMarket = orderType === 'MARKET';

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleLimitPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setLimitPrice(value);
    }
  };

  const getTradePreview = () => {
    if (!amount || parseFloat(amount) <= 0) return null;

    if (isMarket) {
      const amountNum = parseFloat(amount);
      const preview = calculateSlippage(amountNum, isBuy);
      return preview;
    } else {
      if (!limitPrice || parseFloat(limitPrice) <= 0) return null;
      return {
        effectivePrice: parseFloat(limitPrice),
        amountOut: isBuy ? parseFloat(amount) / parseFloat(limitPrice) : parseFloat(amount) * parseFloat(limitPrice),
        fee: parseFloat(amount) * 0.003
      };
    }
  };

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return;

    if (isMarket) {
      onExecuteTrade(amountNum, isBuy);
      setAmount('');
    } else {
      const priceNum = parseFloat(limitPrice);
      if (!priceNum || priceNum <= 0) return;
      onPlaceLimitOrder(priceNum, amountNum, isBuy);
      setAmount('');
      setLimitPrice('');
    }
  };

  const preview = getTradePreview();

  const canTrade = () => {
    if (!amount || parseFloat(amount) <= 0) return false;
    if (!isMarket && (!limitPrice || parseFloat(limitPrice) <= 0)) return false;

    const amountNum = parseFloat(amount);
    if (isBuy) {
      return balance.bc >= amountNum;
    } else {
      return balance.blob >= amountNum;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      {/* Order Type Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOrderType('MARKET')}
          className={`flex-1 py-2 px-4 rounded text-sm font-semibold transition-colors ${
            orderType === 'MARKET'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('LIMIT')}
          className={`flex-1 py-2 px-4 rounded text-sm font-semibold transition-colors ${
            orderType === 'LIMIT'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Limit
        </button>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide('BUY')}
          className={`flex-1 py-2 px-4 rounded text-sm font-semibold transition-colors ${
            side === 'BUY'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={`flex-1 py-2 px-4 rounded text-sm font-semibold transition-colors ${
            side === 'SELL'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Limit Price Input (only for limit orders) */}
      {!isMarket && (
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Limit Price (BC)</label>
          <input
            type="text"
            value={limitPrice}
            onChange={handleLimitPriceChange}
            placeholder="0.00"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Current: {currentPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Amount ({isBuy ? 'BC' : '$BLOB'})
        </label>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Available: {isBuy ? balance.bc.toFixed(2) : balance.blob.toFixed(4)}</span>
          <button
            onClick={() => setAmount(isBuy ? balance.bc.toString() : balance.blob.toString())}
            className="text-blue-400 hover:text-blue-300"
          >
            Max
          </button>
        </div>
      </div>

      {/* Trade Preview */}
      {preview && (
        <div className="bg-gray-800 rounded p-3 mb-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>You {isBuy ? 'receive' : 'pay'}:</span>
            <span className="text-white font-mono">
              {preview.amountOut.toFixed(4)} {isBuy ? '$BLOB' : 'BC'}
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Price:</span>
            <span className="text-white font-mono">{preview.effectivePrice.toFixed(2)} BC</span>
          </div>
          {isMarket && preview.slippage !== undefined && (
            <div className="flex justify-between text-gray-400">
              <span>Slippage:</span>
              <span className={`font-mono ${Math.abs(preview.slippage) > 5 ? 'text-red-400' : 'text-white'}`}>
                {preview.slippage.toFixed(2)}%
              </span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>Fee (0.3%):</span>
            <span className="text-white font-mono">{preview.fee.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canTrade()}
        className={`w-full py-3 rounded font-semibold text-white transition-colors ${
          canTrade()
            ? isBuy
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
            : 'bg-gray-700 cursor-not-allowed'
        }`}
      >
        {isMarket ? (isBuy ? 'Buy $BLOB' : 'Sell $BLOB') : 'Place Limit Order'}
      </button>

      {/* Balance Display */}
      <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-gray-400 mb-1">Blobis Coins</div>
          <div className="text-white font-mono font-semibold">{balance.bc.toFixed(2)} BC</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">$BLOB Tokens</div>
          <div className="text-white font-mono font-semibold">{balance.blob.toFixed(4)} $BLOB</div>
        </div>
      </div>
    </div>
  );
};

export default TradingPanel;
