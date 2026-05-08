import React from 'react';

const TradeHistory = ({ trades, maxItems = 20 }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatPrice = (price) => price.toFixed(2);
  const formatAmount = (amount) => amount.toFixed(4);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-800">
        <span>Time</span>
        <span className="text-right">Price (BC)</span>
        <span className="text-right">Amount ($BLOB)</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {trades.length > 0 ? (
          trades.slice(0, maxItems).map((trade, index) => (
            <div
              key={`${trade.timestamp}_${index}`}
              className="grid grid-cols-3 gap-2 px-3 py-1.5 text-xs font-mono hover:bg-white/5 transition-colors"
            >
              <span className="text-gray-400">{formatTime(trade.timestamp)}</span>
              <span className={`text-right font-semibold ${
                trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPrice(trade.price)}
              </span>
              <span className="text-gray-300 text-right">{formatAmount(trade.amount)}</span>
            </div>
          ))
        ) : (
          <div className="px-3 py-8 text-center text-sm text-gray-600">
            No trades yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
