import React, { useRef, useEffect, useState } from 'react';

const CandlestickChart = ({ candles, currentCandle, width = 800, height = 500 }) => {
  const canvasRef = useRef(null);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const animationFrameRef = useRef(null);

  const PADDING = { top: 20, right: 80, bottom: 60, left: 10 };
  const CHART_HEIGHT = height - PADDING.top - PADDING.bottom;
  const VOLUME_HEIGHT = CHART_HEIGHT * 0.2;
  const PRICE_HEIGHT = CHART_HEIGHT - VOLUME_HEIGHT - 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const allCandles = currentCandle ? [...candles, currentCandle] : candles;
      if (allCandles.length === 0) return;

      // Calculate price range
      const prices = allCandles.flatMap(c => [c.high, c.low]);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const priceRange = maxPrice - minPrice || 1;

      // Calculate volume range
      const maxVolume = Math.max(...allCandles.map(c => c.volume));

      // Calculate candle width
      const chartWidth = width - PADDING.left - PADDING.right;
      const candleWidth = Math.max(2, Math.min(20, chartWidth / allCandles.length - 2));
      const candleSpacing = candleWidth + 2;

      // Draw grid
      drawGrid(ctx, minPrice, maxPrice, priceRange);

      // Draw candles
      allCandles.forEach((candle, index) => {
        const x = PADDING.left + index * candleSpacing + candleSpacing / 2;
        drawCandle(ctx, candle, x, candleWidth, minPrice, priceRange, maxVolume, index === allCandles.length - 1 && currentCandle);
      });

      // Draw price axis
      drawPriceAxis(ctx, minPrice, maxPrice, priceRange);

      // Draw hovered candle info
      if (hoveredCandle) {
        drawCandleInfo(ctx, hoveredCandle);
      }
    };

    const drawGrid = (ctx, minPrice, maxPrice, priceRange) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      const gridLines = 8;
      for (let i = 0; i <= gridLines; i++) {
        const y = PADDING.top + (PRICE_HEIGHT * i) / gridLines;
        ctx.beginPath();
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(width - PADDING.right, y);
        ctx.stroke();
      }
    };

    const drawCandle = (ctx, candle, x, candleWidth, minPrice, priceRange, maxVolume, isCurrent) => {
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#10b981' : '#ef4444';

      // Price candle
      const highY = PADDING.top + ((maxPrice - candle.high) / priceRange) * PRICE_HEIGHT;
      const lowY = PADDING.top + ((maxPrice - candle.low) / priceRange) * PRICE_HEIGHT;
      const openY = PADDING.top + ((maxPrice - candle.open) / priceRange) * PRICE_HEIGHT;
      const closeY = PADDING.top + ((maxPrice - candle.close) / priceRange) * PRICE_HEIGHT;

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;

      ctx.fillStyle = color;
      if (isCurrent) {
        ctx.globalAlpha = 0.7;
      }
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      ctx.globalAlpha = 1;

      // Draw volume bar
      const volumeHeight = (candle.volume / maxVolume) * VOLUME_HEIGHT;
      const volumeY = PADDING.top + PRICE_HEIGHT + 10;

      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(x - candleWidth / 2, volumeY + VOLUME_HEIGHT - volumeHeight, candleWidth, volumeHeight);
    };

    const drawPriceAxis = (ctx, minPrice, maxPrice, priceRange) => {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';

      const priceSteps = 8;
      for (let i = 0; i <= priceSteps; i++) {
        const price = maxPrice - (priceRange * i) / priceSteps;
        const y = PADDING.top + (PRICE_HEIGHT * i) / priceSteps;
        ctx.fillText(price.toFixed(2), width - PADDING.right + 5, y + 4);
      }

      // Volume label
      ctx.fillText('Volume', width - PADDING.right + 5, PADDING.top + PRICE_HEIGHT + 20);
    };

    const drawCandleInfo = (ctx, candle) => {
      const info = [
        `O: ${candle.open.toFixed(2)}`,
        `H: ${candle.high.toFixed(2)}`,
        `L: ${candle.low.toFixed(2)}`,
        `C: ${candle.close.toFixed(2)}`,
        `V: ${candle.volume.toFixed(2)}`
      ];

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(PADDING.left + 10, PADDING.top + 10, 150, 90);

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';

      info.forEach((text, i) => {
        ctx.fillText(text, PADDING.left + 20, PADDING.top + 30 + i * 16);
      });
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [candles, currentCandle, width, height, hoveredCandle]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const allCandles = currentCandle ? [...candles, currentCandle] : candles;
    const chartWidth = width - PADDING.left - PADDING.right;
    const candleSpacing = chartWidth / allCandles.length;
    const index = Math.floor((x - PADDING.left) / candleSpacing);

    if (index >= 0 && index < allCandles.length) {
      setHoveredCandle(allCandles[index]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-crosshair"
    />
  );
};

export default CandlestickChart;
