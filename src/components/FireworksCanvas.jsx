import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const PALETTES = {
  gold: ['#f5d99a', '#fff4dd', '#f8c76b', '#e8c78d'],
  rose: ['#f1c0ae', '#d9a08e', '#f8d7c8', '#fff0e2'],
  white: ['#fff8e9', '#f8edda', '#e8c78d']
};
const STAR_COUNT = 72;

export const FireworksCanvas = forwardRef(function FireworksCanvas({ reducedMotion = false }, ref) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef(null);

  useImperativeHandle(ref, () => ({
    launchRockets() {
      stateRef.current?.launchRockets();
    },
    burstSalvo() {
      stateRef.current?.burstSalvo();
    },
    startSustainedShow() {
      stateRef.current?.startSustainedShow();
    },
    finalBurst() {
      stateRef.current?.finalBurst();
    }
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = 1;
    let lastFrame = 0;
    let lastAmbient = 0;
    const introStart = performance.now();
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.35 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.4
    }));
    const rockets = [];
    const particles = [];
    const particlePool = [];
    const pendingBursts = [];
    let particleLimit = width < 600 ? 480 : 1100;
    let sustainedShow = false;
    let nextSustainedBurst = Infinity;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      particleLimit = width < 600 ? 480 : 1100;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      rockets.forEach((rocket) => {
        rocket.startX = rocket.startXRatio * width;
        rocket.startY = height + 12;
        rocket.targetX = rocket.targetXRatio * width;
        rocket.targetY = rocket.targetYRatio * height;
        rocket.x = rocket.startX;
        rocket.y = rocket.startY;
        rocket.trail.length = 0;
      });
      if (particles.length > particleLimit) particles.length = particleLimit;
      if (particlePool.length > particleLimit) particlePool.length = particleLimit;
      if (reducedMotion) drawStars(performance.now());
    };

    const drawStars = (now) => {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        const introFade = reducedMotion ? 1 : Math.min(1, (now - introStart) / 1800);
        const twinkle = (reducedMotion ? 0.58 : 0.35 + (Math.sin(now * 0.0007 * star.speed + star.phase) + 1) * 0.26) * introFade;
        context.globalAlpha = twinkle;
        context.fillStyle = '#f6dfb1';
        context.beginPath();
        context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
    };

    const addParticle = (x, y, angle, speed, options = {}) => {
      if (particles.length >= particleLimit) return;
      const particle = particlePool.pop() || {};
      const lifetime = options.lifetime || 1.4 + Math.random() * 1.7;
      Object.assign(particle, {
        x,
        y,
        previousX: x,
        previousY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: options.gravity ?? 62,
        drag: options.drag ?? 0.986,
        life: lifetime,
        maxLife: lifetime,
        radius: options.radius || 0.8 + Math.random() * 1.5,
        color: options.color || (options.palette || PALETTES.gold)[Math.floor(Math.random() * (options.palette || PALETTES.gold).length)],
        sparkle: Math.random() > 0.74
      });
      particles.push(particle);
    };

    const explode = (x, y, pattern = 'circle', now = performance.now(), scale = 1, secondary = false) => {
      const count = (width < 600 ? 66 : 118) * scale | 0;
      const palette = pattern === 'rose' ? PALETTES.rose : pattern === 'white' ? PALETTES.white : PALETTES.gold;
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.08;
        let speed = 80 + Math.random() * 125;
        let options = { palette };

        if (pattern === 'willow') {
          speed = 48 + Math.random() * 105;
          options = { palette, gravity: 112, drag: 0.993, lifetime: 2.3 + Math.random() * 1.7 };
        } else if (pattern === 'star') {
          const point = Math.cos(angle * 5);
          speed *= point > 0.62 ? 1.45 : 0.64;
        } else if (pattern === 'multi') {
          speed *= 1 + Math.cos(angle * 6) * 0.16;
        } else if (pattern === 'rose') {
          speed *= 0.86 + Math.random() * 0.35;
        }

        addParticle(x, y, angle, speed, options);
      }

      const secondaryCount = width < 600 ? 20 : 32;
      for (let index = 0; index < secondaryCount; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        addParticle(x, y, angle, 25 + Math.random() * 62, {
          color: '#fff4dd',
          gravity: 42,
          lifetime: 0.45 + Math.random() * 0.55,
          radius: 0.7 + Math.random()
        });
      }

      if (!secondary) {
        const offset = 12 + Math.random() * 20;
        pendingBursts.push({
          x: x + (Math.random() - 0.5) * offset,
          y: y + (Math.random() - 0.5) * offset,
          time: now + 190 + Math.random() * 130,
          pattern: pattern === 'willow' ? 'gold' : 'white',
          scale: 0.3
        });
      }
    };

    const launchRockets = () => {
      if (reducedMotion) return;
      const launches = [
        { start: 0.13, target: 0.34, height: 0.27, duration: 1120, pattern: 'circle' },
        { start: 0.5, target: 0.57, height: 0.2, duration: 1380, pattern: 'star' },
        { start: 0.87, target: 0.73, height: 0.31, duration: 980, pattern: 'willow' }
      ];
      const startAt = performance.now();
      launches.forEach((launch, index) => {
        rockets.push({
          startXRatio: launch.start,
          startY: height + 12,
          targetXRatio: launch.target,
          targetYRatio: launch.height,
          startX: width * launch.start,
          targetX: width * launch.target,
          targetY: height * launch.height,
          x: width * launch.start,
          y: height + 12,
          startAt: startAt + index * 170,
          duration: launch.duration + index * 75,
          pattern: launch.pattern,
          trail: []
        });
      });
    };

    const burstSalvo = () => {
      if (reducedMotion) return;
      const positions = [
        [0.12 + Math.random() * 0.1, 0.18 + Math.random() * 0.35, 'willow'],
        [0.43 + Math.random() * 0.14, 0.14 + Math.random() * 0.3, 'star'],
        [0.76 + Math.random() * 0.1, 0.2 + Math.random() * 0.35, 'rose']
      ];
      positions.forEach(([x, y, pattern], index) => {
        explode(width * x, height * y, index === 1 && Math.random() > 0.5 ? 'multi' : pattern, performance.now(), index === 1 ? 1.16 : 1);
      });
    };

    const burstSingle = () => {
      if (reducedMotion) return;
      const patterns = ['gold', 'rose', 'star', 'willow', 'multi'];
      const x = width * (0.12 + Math.random() * 0.76);
      const y = height * (0.16 + Math.random() * 0.36);
      explode(x, y, patterns[Math.floor(Math.random() * patterns.length)], performance.now(), 1.05);
    };

    const startSustainedShow = () => {
      if (reducedMotion) return;
      sustainedShow = true;
      nextSustainedBurst = performance.now() + 1900;
    };

    const finalBurst = () => {
      if (reducedMotion) return;
      const now = performance.now();
      [
        [0.2, 0.34, 'rose'],
        [0.5, 0.22, 'multi'],
        [0.8, 0.36, 'willow']
      ].forEach(([x, y, pattern]) => {
        explode(width * x, height * y, pattern, now, 1.15);
      });
    };

    const drawRocket = (rocket) => {
      const trail = rocket.trail;
      context.lineCap = 'round';
      for (let index = 1; index < trail.length; index += 1) {
        const alpha = index / trail.length;
        context.globalAlpha = alpha * 0.7;
        context.strokeStyle = '#f4d28d';
        context.lineWidth = 0.8 + alpha * 1.4;
        context.beginPath();
        context.moveTo(trail[index - 1].x, trail[index - 1].y);
        context.lineTo(trail[index].x, trail[index].y);
        context.stroke();
      }
      context.globalAlpha = 1;
      context.fillStyle = '#fff8dc';
      context.shadowBlur = 12;
      context.shadowColor = '#f3c96f';
      context.beginPath();
      context.arc(rocket.x, rocket.y, 2.2, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    };

    const render = (now) => {
      if (document.hidden) {
        animationRef.current = null;
        return;
      }
      const delta = Math.min(0.035, Math.max(0.001, (now - (lastFrame || now)) / 1000));
      lastFrame = now;
      drawStars(now);

      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index];
        if (now < rocket.startAt) continue;
        const progress = Math.min(1, (now - rocket.startAt) / rocket.duration);
        const eased = 1 - (1 - progress) ** 2;
        rocket.x = rocket.startX + (rocket.targetX - rocket.startX) * eased;
        rocket.y = rocket.startY + (rocket.targetY - rocket.startY) * eased;
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > 12) rocket.trail.shift();
        drawRocket(rocket);
        if (Math.random() > 0.55) {
          addParticle(rocket.x, rocket.y + 3, Math.PI / 2 + (Math.random() - 0.5), 18 + Math.random() * 46, {
            color: '#f5d99a',
            gravity: 80,
            drag: 0.97,
            lifetime: 0.3 + Math.random() * 0.35,
            radius: 0.7 + Math.random() * 0.8
          });
        }
        if (progress === 1) {
          explode(rocket.x, rocket.y, rocket.pattern, now);
          rockets.splice(index, 1);
        }
      }

      for (let index = pendingBursts.length - 1; index >= 0; index -= 1) {
        const burst = pendingBursts[index];
        if (now >= burst.time) {
          explode(burst.x, burst.y, burst.pattern, now, burst.scale, true);
          pendingBursts.splice(index, 1);
        }
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.previousX = particle.x;
        particle.previousY = particle.y;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vx *= particle.drag ** (delta * 60);
        particle.vy = particle.vy * particle.drag ** (delta * 60) + particle.gravity * delta;
        particle.life -= delta;
        const alpha = Math.max(0, particle.life / particle.maxLife);
        if (alpha > 0) {
          context.globalAlpha = particle.sparkle && Math.sin(now * 0.018 + particle.x) > 0.7 ? alpha * 0.35 : alpha;
          context.strokeStyle = particle.color;
          context.lineWidth = particle.radius;
          context.shadowBlur = particle.sparkle ? 6 : 0;
          context.shadowColor = particle.color;
          context.beginPath();
          context.moveTo(particle.previousX, particle.previousY);
          context.lineTo(particle.x, particle.y);
          context.stroke();
          context.fillStyle = '#fffaf0';
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius * 0.55, 0, Math.PI * 2);
          context.fill();
        }
        if (particle.life <= 0) {
          particles.splice(index, 1);
          if (particlePool.length < particleLimit) particlePool.push(particle);
        }
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;

      if (now - lastAmbient > 1700) {
        lastAmbient = now;
        const x = Math.random() * width;
        const y = height * (0.25 + Math.random() * 0.5);
        addParticle(x, y, -Math.PI / 2 + (Math.random() - 0.5) * 1.2, 12 + Math.random() * 18, {
          color: '#f5e1b5',
          gravity: 4,
          lifetime: 1.4 + Math.random(),
          radius: 0.8
        });
      }
      if (sustainedShow && now >= nextSustainedBurst) {
        burstSingle();
        nextSustainedBurst = now + 1450 + Math.random() * 650;
      }
      animationRef.current = window.requestAnimationFrame(render);
    };

    const resume = () => {
      if (!document.hidden && !reducedMotion && !animationRef.current) {
        lastFrame = 0;
        animationRef.current = window.requestAnimationFrame(render);
      }
    };
    const pause = () => {
      if (document.hidden && animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) pause();
      else resume();
    };

    stateRef.current = { launchRockets, burstSalvo, startSustainedShow, finalBurst };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    if (!reducedMotion) animationRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      stateRef.current = null;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="birthday-fireworks-canvas" aria-hidden="true" />;
});
