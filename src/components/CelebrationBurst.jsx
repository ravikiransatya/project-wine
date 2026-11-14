import React, { useEffect, useRef } from 'react';

const palettes = [
  ['#fff6d5', '#ffd166', '#ff9f1c'],
  ['#fff8ed', '#ff4d6d', '#c9184a'],
  ['#effaff', '#67d5ff', '#357ded'],
  ['#fff8df', '#f7c948', '#a8d672']
];

export function CelebrationBurst({ active = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!active || !canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrame = 0;
    const startTime = performance.now();
    const rockets = [];
    const particles = [];
    const launchTimes = [0, 340, 680, 1020, 1380, 1740, 2110];
    let nextLaunch = 0;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const explode = (rocket) => {
      const palette = palettes[rocket.palette];
      const particleCount = width < 600 ? 78 : 112;
      const isWillow = rocket.palette === 0;

      for (let i = 0; i < particleCount; i += 1) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.08;
        const speed = 105 + Math.random() * (isWillow ? 230 : 190);
        const velocity = speed * (0.75 + Math.random() * 0.45);
        const lifetime = 1.5 + Math.random() * (isWillow ? 1.5 : 0.65);
        particles.push({
          x: rocket.x,
          y: rocket.y,
          previousX: rocket.x,
          previousY: rocket.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          gravity: isWillow ? 145 : 190,
          drag: isWillow ? 0.982 : 0.976,
          life: lifetime,
          maxLife: lifetime,
          radius: 1.1 + Math.random() * 1.5,
          color: palette[Math.floor(Math.random() * palette.length)],
          twinkle: Math.random() > 0.68
        });
      }

      for (let i = 0; i < 18; i += 1) {
        const angle = (Math.PI * 2 * i) / 18;
        const speed = 55 + Math.random() * 35;
        particles.push({
          x: rocket.x,
          y: rocket.y,
          previousX: rocket.x,
          previousY: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 120,
          drag: 0.96,
          life: 0.45 + Math.random() * 0.25,
          maxLife: 1,
          radius: 1.8 + Math.random(),
          color: '#fffbea',
          twinkle: false
        });
      }
    };

    const launch = (elapsed) => {
      const startX = width * (0.1 + Math.random() * 0.8);
      rockets.push({
        launchedAt: elapsed,
        x: startX,
        y: height + 12,
        startX,
        startY: height + 12,
        targetX: width * (0.16 + Math.random() * 0.68),
        targetY: height * (0.16 + Math.random() * 0.4),
        duration: 850 + Math.random() * 500,
        palette: Math.floor(Math.random() * palettes.length),
        trail: []
      });
    };

    const drawRocket = (rocket) => {
      const tail = rocket.trail;
      context.lineCap = 'round';
      for (let i = 1; i < tail.length; i += 1) {
        const opacity = i / tail.length;
        context.beginPath();
        context.moveTo(tail[i - 1].x, tail[i - 1].y);
        context.lineTo(tail[i].x, tail[i].y);
        context.strokeStyle = `rgba(255, 218, 136, ${opacity * 0.85})`;
        context.lineWidth = 1 + opacity * 1.5;
        context.shadowBlur = 12;
        context.shadowColor = '#ffc75e';
        context.stroke();
      }

      context.beginPath();
      context.arc(rocket.x, rocket.y, 2.8, 0, Math.PI * 2);
      context.fillStyle = '#fff9dc';
      context.shadowBlur = 18;
      context.shadowColor = '#ffcb63';
      context.fill();
      context.shadowBlur = 0;
    };

    const drawParticle = (particle) => {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      if (alpha <= 0) return;

      context.beginPath();
      context.moveTo(particle.previousX, particle.previousY);
      context.lineTo(particle.x, particle.y);
      context.strokeStyle = particle.color;
      context.globalAlpha = particle.twinkle && Math.random() > 0.7 ? alpha * 0.35 : alpha;
      context.lineWidth = particle.radius;
      context.lineCap = 'round';
      context.shadowBlur = 10;
      context.shadowColor = particle.color;
      context.stroke();

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * 0.8, 0, Math.PI * 2);
      context.fillStyle = '#fffdf2';
      context.fill();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const render = (now) => {
      const elapsed = now - startTime;
      const delta = Math.min(0.032, Math.max(0.001, (now - (render.previousTime || now)) / 1000));
      render.previousTime = now;
      context.clearRect(0, 0, width, height);

      while (nextLaunch < launchTimes.length && elapsed >= launchTimes[nextLaunch]) {
        launch(elapsed);
        nextLaunch += 1;
      }

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const rocket = rockets[i];
        const progress = Math.min(1, (elapsed - rocket.launchedAt) / rocket.duration);
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > 10) rocket.trail.shift();

        const eased = 1 - (1 - progress) * (1 - progress);
        rocket.x = rocket.startX + (rocket.targetX - rocket.startX) * eased;
        rocket.y = rocket.startY + (rocket.targetY - rocket.startY) * eased;
        drawRocket(rocket);

        if (progress >= 1) {
          explode(rocket);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.previousX = particle.x;
        particle.previousY = particle.y;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vx *= Math.pow(particle.drag, delta * 60);
        particle.vy = particle.vy * Math.pow(particle.drag, delta * 60) + particle.gravity * delta;
        particle.life -= delta;
        drawParticle(particle);
        if (particle.life <= 0) particles.splice(i, 1);
      }

      if (nextLaunch < launchTimes.length || rockets.length || particles.length) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [active]);

  if (!active) return null;

  return <canvas ref={canvasRef} className="fireworks-layer" aria-hidden="true" />;
}
