import React from 'react';

const FEATHERS = [
  { id: 1, left: '12%', delay: '0s', duration: '13s', scale: 0.9, sway: '6.5s' },
  { id: 2, left: '76%', delay: '2.8s', duration: '15s', scale: 0.8, sway: '7.2s' },
  { id: 3, left: '38%', delay: '6.5s', duration: '16s', scale: 0.65, sway: '5.8s' },
  { id: 4, left: '88%', delay: '8.2s', duration: '14s', scale: 0.75, sway: '6.8s' }
];

export function OwlFeathers({ active = true }) {
  if (!active) return null;

  return (
    <div className="owl-feathers-container" aria-hidden="true">
      {FEATHERS.map((f) => (
        <div
          key={f.id}
          className="owl-feather"
          style={{
            left: f.left,
            animationDelay: f.delay,
            animationDuration: f.duration,
            '--sway-duration': f.sway,
            transform: `scale(${f.scale})`
          }}
        >
          <div className="feather-sway-inner">
            <svg viewBox="0 0 40 120" className="feather-svg" width="36" height="108">
              <defs>
                <linearGradient id={`featherGrad-${f.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#fff9ed" stopOpacity="0.88" />
                  <stop offset="90%" stopColor="#e5c179" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#c99b53" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {/* Outer Feather Vane */}
              <path
                d="M20,0 C27,22 39,55 36,90 C33,105 25,116 20,120 C15,116 7,105 4,90 C1,55 13,22 20,0 Z"
                fill={`url(#featherGrad-${f.id})`}
              />
              {/* Central Quill Shaft */}
              <path d="M20,0 Q19.5,60 20,120" stroke="#f4e4bf" strokeWidth="1.6" strokeLinecap="round" />
              {/* Subtle Delicate Barb Lines */}
              <path d="M20,24 Q28,32 33,39 M20,42 Q30,52 35,63 M20,64 Q29,76 33,88" stroke="#ffffff" strokeWidth="0.8" opacity="0.65" />
              <path d="M20,24 Q12,32 7,39 M20,42 Q10,52 5,63 M20,64 Q11,76 7,88" stroke="#ffffff" strokeWidth="0.8" opacity="0.65" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

