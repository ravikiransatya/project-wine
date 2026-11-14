import React, { useMemo } from 'react';

export function FirefliesAndButterflies({ active = true }) {
  // Fireflies distributed in open ambient space
  const fireflies = useMemo(() => [
    { id: 'ff-1', left: '10%', top: '22%', size: 6, dur: '7s', delay: '0s', blur: 3 },
    { id: 'ff-2', left: '16%', top: '65%', size: 8, dur: '9s', delay: '-2.5s', blur: 5 },
    { id: 'ff-3', left: '84%', top: '26%', size: 7, dur: '8.5s', delay: '-1.2s', blur: 4 },
    { id: 'ff-4', left: '88%', top: '68%', size: 9, dur: '10s', delay: '-3.7s', blur: 6 },
    { id: 'ff-5', left: '25%', top: '82%', size: 5, dur: '7.8s', delay: '-4.1s', blur: 3 },
    { id: 'ff-6', left: '74%', top: '80%', size: 7, dur: '8.2s', delay: '-2.0s', blur: 4 },
    { id: 'ff-7', left: '6%', top: '44%', size: 10, dur: '11s', delay: '-5.3s', blur: 7 },
    { id: 'ff-8', left: '94%', top: '46%', size: 8, dur: '9.2s', delay: '-0.8s', blur: 5 }
  ], []);

  // 2 Golden Butterflies with 3D fluttering wings in side open zones
  const butterflies = useMemo(() => [
    { id: 'bf-1', left: '14%', top: '35%', dur: '14s', delay: '0s', scale: 0.85, rot: '12deg' },
    { id: 'bf-2', left: '82%', top: '42%', dur: '16s', delay: '-7s', scale: 0.78, rot: '-15deg' }
  ], []);

  if (!active) return null;

  return (
    <div className="fireflies-butterflies-layer" aria-hidden="true">
      {/* Golden Fireflies with Bokeh Glow */}
      {fireflies.map((f) => (
        <span
          key={f.id}
          className="ambient-firefly"
          style={{
            left: f.left,
            top: f.top,
            width: `${f.size}px`,
            height: `${f.size}px`,
            filter: `blur(${f.blur}px)`,
            animationDuration: f.dur,
            animationDelay: f.delay
          }}
        />
      ))}

      {/* 3D Fluttering Golden Foil Butterflies */}
      {butterflies.map((b) => (
        <div
          key={b.id}
          className={`golden-butterfly butterfly-${b.id}`}
          style={{
            left: b.left,
            top: b.top,
            animationDuration: b.dur,
            animationDelay: b.delay,
            transform: `scale(${b.scale}) rotate(${b.rot})`
          }}
        >
          <div className="butterfly-body">
            {/* Left Wing with Golden Filigree Pattern */}
            <div className="butterfly-wing wing-left">
              <svg viewBox="0 0 50 60" width="34" height="42">
                <defs>
                  <linearGradient id={`goldWingL-${b.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#ffd700" stopOpacity="0.85" />
                    <stop offset="85%" stopColor="#c99b53" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#8c5828" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path
                  d="M48,30 C45,10 25,0 10,8 C-2,15 2,35 18,38 C8,44 6,55 18,58 C32,60 44,48 48,30 Z"
                  fill={`url(#goldWingL-${b.id})`}
                  stroke="#fff6d6"
                  strokeWidth="0.8"
                />
                <circle cx="20" cy="22" r="3.5" fill="#fff" opacity="0.6" />
                <path d="M48,30 Q30,24 16,14" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
                <path d="M48,30 Q32,38 20,48" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
              </svg>
            </div>

            {/* Torso & Antennae */}
            <div className="butterfly-torso">
              <span className="antenna ant-left" />
              <span className="torso-core" />
              <span className="antenna ant-right" />
            </div>

            {/* Right Wing with Golden Filigree Pattern */}
            <div className="butterfly-wing wing-right">
              <svg viewBox="0 0 50 60" width="34" height="42">
                <defs>
                  <linearGradient id={`goldWingR-${b.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#ffd700" stopOpacity="0.85" />
                    <stop offset="85%" stopColor="#c99b53" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#8c5828" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path
                  d="M2,30 C5,10 25,0 40,8 C52,15 48,35 32,38 C42,44 44,55 32,58 C18,60 6,48 2,30 Z"
                  fill={`url(#goldWingR-${b.id})`}
                  stroke="#fff6d6"
                  strokeWidth="0.8"
                />
                <circle cx="30" cy="22" r="3.5" fill="#fff" opacity="0.6" />
                <path d="M2,30 Q20,24 34,14" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
                <path d="M2,30 Q18,38 30,48" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

