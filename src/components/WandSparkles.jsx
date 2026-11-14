import React, { useEffect, useRef } from 'react';

export function WandSparkles({ enabled = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#f4dfaa', '#ffd700', '#fff4d1', '#e5b972', '#ffecb3'];

    const addParticle = (x, y) => {
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6 - 0.6,
          size: Math.random() * 3.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.1
        });
      }
      if (particles.length > 90) particles.splice(0, 15);
    };

    const handlePointerMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0]?.clientX);
      const y = e.clientY || (e.touches && e.touches[0]?.clientY);
      if (x !== undefined && y !== undefined) {
        addParticle(x, y);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    const drawStar = (cx, cy, spikes, outerRadius, innerRadius, color, alpha, rot) => {
      ctx.save();
      ctx.beginPath();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      let step = Math.PI / spikes;
      for (let i = 0; i < 2 * spikes; i++) {
        let r = (i % 2 === 0) ? outerRadius : innerRadius;
        let currX = Math.cos(i * step) * r;
        let currY = Math.sin(i * step) * r;
        if (i === 0) ctx.moveTo(currX, currY);
        else ctx.lineTo(currX, currY);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.shadowColor = '#ffe394';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.spin;
        p.size *= 0.98;

        if (p.alpha <= 0 || p.size <= 0.2) {
          particles.splice(i, 1);
          continue;
        }

        drawStar(p.x, p.y, 4, p.size, p.size * 0.45, p.color, p.alpha, p.rotation);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="wand-sparkles-canvas"
      aria-hidden="true"
    />
  );
}

