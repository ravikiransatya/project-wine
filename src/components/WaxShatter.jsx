import React, { useMemo } from 'react';

export function WaxShatter({ triggerKey }) {
  const pieces = useMemo(() => {
    if (!triggerKey) return [];

    const shards = [
      { id: 1, angle: 15, dist: 70, size: 13, rot: 140, color: '#881f26', clip: 'polygon(0% 0%, 100% 25%, 75% 100%, 10% 85%)' },
      { id: 2, angle: 52, dist: 85, size: 11, rot: -190, color: '#631218', clip: 'polygon(20% 0%, 100% 0%, 90% 100%, 0% 70%)' },
      { id: 3, angle: 95, dist: 65, size: 14, rot: 230, color: '#a32932', clip: 'polygon(0% 15%, 85% 0%, 100% 85%, 25% 100%)' },
      { id: 4, angle: 135, dist: 78, size: 10, rot: -140, color: '#560e13', clip: 'polygon(15% 0%, 100% 30%, 80% 100%, 0% 90%)' },
      { id: 5, angle: 170, dist: 82, size: 12, rot: 175, color: '#881f26', clip: 'polygon(0% 0%, 90% 20%, 70% 100%, 15% 80%)' },
      { id: 6, angle: 215, dist: 68, size: 13, rot: -210, color: '#9e262f', clip: 'polygon(30% 0%, 100% 15%, 85% 100%, 0% 85%)' },
      { id: 7, angle: 255, dist: 88, size: 11, rot: 280, color: '#6e141a', clip: 'polygon(0% 20%, 100% 0%, 80% 90%, 10% 100%)' },
      { id: 8, angle: 290, dist: 72, size: 14, rot: -160, color: '#b32e38', clip: 'polygon(10% 0%, 95% 25%, 75% 100%, 0% 70%)' },
      { id: 9, angle: 325, dist: 80, size: 12, rot: 210, color: '#560e13', clip: 'polygon(0% 0%, 100% 10%, 90% 90%, 20% 100%)' },
      { id: 10, angle: 355, dist: 60, size: 9, rot: -90, color: '#881f26', clip: 'polygon(25% 0%, 100% 30%, 70% 100%, 0% 80%)' }
    ];

    const sparkles = [
      { id: 'sp-1', angle: 30, dist: 65, size: 10, delay: '0.04s' },
      { id: 'sp-2', angle: 110, dist: 75, size: 12, delay: '0.08s' },
      { id: 'sp-3', angle: 190, dist: 70, size: 11, delay: '0.02s' },
      { id: 'sp-4', angle: 270, dist: 80, size: 13, delay: '0.06s' },
      { id: 'sp-5', angle: 340, dist: 60, size: 9, delay: '0.1s' }
    ];

    return { shards, sparkles };
  }, [triggerKey]);

  if (!triggerKey || !pieces.shards) return null;

  return (
    <div className="wax-shatter-burst" key={triggerKey} aria-hidden="true">
      {pieces.shards.map((s) => {
        const rad = (s.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * s.dist;
        const ty = Math.sin(rad) * s.dist;

        return (
          <span
            key={s.id}
            className="wax-shard-fragment"
            style={{
              '--tx': `${tx.toFixed(1)}px`,
              '--ty': `${ty.toFixed(1)}px`,
              '--rot': `${s.rot}deg`,
              width: `${s.size}px`,
              height: `${Math.round(s.size * 0.85)}px`,
              backgroundColor: s.color,
              clipPath: s.clip
            }}
          />
        );
      })}

      {pieces.sparkles.map((sp) => {
        const rad = (sp.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * sp.dist;
        const ty = Math.sin(rad) * sp.dist;

        return (
          <span
            key={sp.id}
            className="wax-sparkle-star"
            style={{
              '--tx': `${tx.toFixed(1)}px`,
              '--ty': `${ty.toFixed(1)}px`,
              fontSize: `${sp.size}px`,
              animationDelay: sp.delay
            }}
          >
            ✦
          </span>
        );
      })}
    </div>
  );
}

