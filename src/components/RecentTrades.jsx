import React from 'react';

const RecentTrades = ({ trades }) => {
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
      <div className="text-sm font-bold text-white mb-3">Recent Trades</div>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-2 px-2">
        <div>Price (BC)</div>
        <div className="text-right">Amount ($BLOB)</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {trades && trades.length > 0 ? (
          trades.slice(0, 20).map((trade, i) => {
            const isBuy = trade.type === 'BUY';
            const time = trade.timestamp
              ? new Date(trade.timestamp.seconds * 1000).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              : 'Just now';

            return (
              <div
                key={trade.id || i}
                className="grid grid-cols-3 gap-2 text-xs px-2 py-1.5 rounded hover:bg-white/5"
              >
                <div className={`font-semibold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.price?.toFixed(2) || '0.00'}
                </div>
                <div className="text-white text-right">
                  {trade.amountOut?.toFixed(4) || '0.0000'}
                </div>
                <div className="text-gray-400 text-right text-[10px]">
                  {time}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 py-8 text-sm">
            No recent trades
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTrades;
