import React from 'react';

const OrderBook = ({ orderBook, currentPrice, onCancelOrder }) => {
  const formatPrice = (price) => price.toFixed(2);
  const formatAmount = (amount) => amount.toFixed(4);

  const calculateTotal = (orders) => {
    let total = 0;
    return orders.map(order => {
      total += order.amount;
      return { ...order, total };
    });
  };

  const asksWithTotal = calculateTotal([...orderBook.asks].reverse());
  const bidsWithTotal = calculateTotal(orderBook.bids);

  const maxTotal = Math.max(
    ...asksWithTotal.map(o => o.total),
    ...bidsWithTotal.map(o => o.total),
    1
  );

  const OrderRow = ({ order, isBid, maxTotal }) => {
    const percentage = (order.total / maxTotal) * 100;
    const bgColor = isBid ? 'bg-green-500/10' : 'bg-red-500/10';

    return (
      <div className="relative group">
        <div
          className={`absolute inset-y-0 right-0 ${bgColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        <div className="relative grid grid-cols-3 gap-2 px-3 py-1 text-xs font-mono hover:bg-white/5 cursor-pointer">
          <span className={isBid ? 'text-green-400' : 'text-red-400'}>
            {formatPrice(order.price)}
          </span>
          <span className="text-gray-300 text-right">{formatAmount(order.amount)}</span>
          <span className="text-gray-500 text-right">{formatAmount(order.total)}</span>
        </div>
        {onCancelOrder && (
          <button
            onClick={() => onCancelOrder(order.id)}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-800">
        <span>Price (BC)</span>
        <span className="text-right">Amount ($BLOB)</span>
        <span className="text-right">Total</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {/* Asks (Sell orders) */}
        <div className="border-b border-gray-800">
          {asksWithTotal.length > 0 ? (
            asksWithTotal.map(order => (
              <OrderRow key={order.id} order={order} isBid={false} maxTotal={maxTotal} />
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs text-gray-600">No sell orders</div>
          )}
        </div>

        {/* Current Price */}
        <div className="bg-gray-800/50 px-3 py-2 border-y border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Current Price</span>
            <span className="text-lg font-bold text-white font-mono">
              {formatPrice(currentPrice)}
            </span>
          </div>
        </div>

        {/* Bids (Buy orders) */}
        <div>
          {bidsWithTotal.length > 0 ? (
            bidsWithTotal.map(order => (
              <OrderRow key={order.id} order={order} isBid={true} maxTotal={maxTotal} />
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs text-gray-600">No buy orders</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
