import React from 'react';

const PERIMETER_CANDLES = [
  // High Ceiling Canopy (well above all titles, eyebrows, and text)
  { id: 'top-1', left: '7%', top: '1.5%', height: 40, scale: 0.82, delay: '0s', duration: '5.2s' },
  { id: 'top-2', left: '20%', top: '3.8%', height: 35, scale: 0.74, delay: '-1.8s', duration: '4.6s' },
  { id: 'top-3', left: '35%', top: '1.2%', height: 46, scale: 0.88, delay: '-3.1s', duration: '5.8s' },
  { id: 'top-4', left: '50%', top: '1%', height: 32, scale: 0.68, delay: '-0.7s', duration: '4.9s' },
  { id: 'top-5', left: '65%', top: '2.4%', height: 42, scale: 0.84, delay: '-2.4s', duration: '5.4s' },
  { id: 'top-6', left: '80%', top: '3.6%', height: 36, scale: 0.75, delay: '-4.2s', duration: '4.8s' },
  { id: 'top-7', left: '92%', top: '1.5%', height: 44, scale: 0.86, delay: '-1.2s', duration: '5.6s' },

  // Far Left Perimeter Flank (empty outer margin outside text reading zone)
  { id: 'left-1', left: '2.2%', top: '18%', height: 44, scale: 0.85, delay: '-0.5s', duration: '5.1s', flank: true },
  { id: 'left-2', left: '3.5%', top: '38%', height: 48, scale: 0.9, delay: '-2.9s', duration: '6.2s', flank: true },
  { id: 'left-3', left: '1.8%', top: '58%', height: 40, scale: 0.78, delay: '-4.1s', duration: '4.7s', flank: true },
  { id: 'left-4', left: '3.2%', top: '78%', height: 45, scale: 0.85, delay: '-1.5s', duration: '5.5s', flank: true },

  // Far Right Perimeter Flank (empty outer margin outside text reading zone)
  { id: 'right-1', left: '97.5%', top: '18%', height: 42, scale: 0.85, delay: '-1.9s', duration: '5.3s', flank: true },
  { id: 'right-2', left: '96.2%', top: '38%', height: 48, scale: 0.9, delay: '-3.7s', duration: '5.9s', flank: true },
  { id: 'right-3', left: '97.8%', top: '58%', height: 38, scale: 0.78, delay: '-0.8s', duration: '4.8s', flank: true },
  { id: 'right-4', left: '96.5%', top: '78%', height: 44, scale: 0.85, delay: '-2.6s', duration: '5.7s', flank: true }
];

export function FloatingCandles({ active = true }) {
  if (!active) return null;

  return (
    <div className="floating-candles-container" aria-hidden="true">
      {PERIMETER_CANDLES.map((c) => (
        <div
          key={c.id}
          className={`floating-candle ${c.flank ? 'flank-candle' : 'canopy-candle'}`}
          style={{
            left: c.left,
            top: c.top,
            animationDelay: c.delay,
            animationDuration: c.duration,
            transform: `scale(${c.scale})`
          }}
        >
          <div className="candle-body" style={{ height: `${c.height}px` }}>
            <span className="candle-wick" />
            <div className="candle-flame">
              <span className="flame-core" />
              <span className="flame-glow" />
            </div>
            <div className="wax-drips" />
          </div>
        </div>
      ))}
    </div>
  );
}
