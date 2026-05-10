import React from 'react';

const OrderBook = ({ poolBC, poolBLOB, currentPrice }) => {
  // Generate synthetic order book based on AMM pool
  const generateOrders = (isBuy) => {
    const orders = [];
    const basePrice = currentPrice;

    for (let i = 0; i < 10; i++) {
      const priceOffset = isBuy ? -i * 0.5 : i * 0.5;
      const price = basePrice + priceOffset;
      const amount = (Math.random() * 50 + 10).toFixed(4);
      const total = (price * amount).toFixed(2);

      orders.push({
        price: price.toFixed(2),
        amount,
        total
      });
    }

    return orders;
  };

  const buyOrders = generateOrders(true);
  const sellOrders = generateOrders(false).reverse();

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
      <div className="text-sm font-bold text-white mb-3">Order Book</div>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-2 px-2">
        <div>Price (BC)</div>
        <div className="text-right">Amount ($BLOB)</div>
        <div className="text-right">Total (BC)</div>
      </div>

      {/* Sell Orders (Red) */}
      <div className="space-y-1 mb-3">
        {sellOrders.map((order, i) => (
          <div
            key={`sell-${i}`}
            className="grid grid-cols-3 gap-2 text-xs px-2 py-1 rounded hover:bg-red-500/10 cursor-pointer relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-red-500/10"
              style={{ width: `${Math.min(100, (parseFloat(order.amount) / 60) * 100)}%` }}
            />
            <div className="text-red-400 relative z-10">{order.price}</div>
            <div className="text-white text-right relative z-10">{order.amount}</div>
            <div className="text-gray-400 text-right relative z-10">{order.total}</div>
          </div>
        ))}
      </div>

      {/* Current Price */}
      <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-2 mb-3 text-center">
        <div className="text-xs text-gray-400">Current Price</div>
        <div className="text-lg font-bold text-yellow-400">{currentPrice.toFixed(2)}</div>
      </div>

      {/* Buy Orders (Green) */}
      <div className="space-y-1">
        {buyOrders.map((order, i) => (
          <div
            key={`buy-${i}`}
            className="grid grid-cols-3 gap-2 text-xs px-2 py-1 rounded hover:bg-green-500/10 cursor-pointer relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-green-500/10"
              style={{ width: `${Math.min(100, (parseFloat(order.amount) / 60) * 100)}%` }}
            />
            <div className="text-green-400 relative z-10">{order.price}</div>
            <div className="text-white text-right relative z-10">{order.amount}</div>
            <div className="text-gray-400 text-right relative z-10">{order.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
