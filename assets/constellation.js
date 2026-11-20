/**
 * 晧脈元素庫 · Hao Element Matrix
 * 背景輕量級分子星網 Canvas 動畫（支援 DPR 高解析度與滑鼠微弱引力連線）
 */

export function initConstellation(canvasId = 'constellation-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const palette = [
    'rgba(0, 230, 118, 0.72)',   // 碳脈綠
    'rgba(64, 196, 255, 0.65)',  // 電離青
    'rgba(179, 136, 255, 0.58)', // 深空紫
    'rgba(255, 215, 64, 0.50)'   // 礦脈金
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let rafId = null;

  const mouse = {
    x: -9999,
    y: -9999,
    active: false
  };

  function createParticles() {
    const area = width * height;
    const count = Math.max(36, Math.min(82, Math.floor(area / 22000)));
    particles = Array.from({ length: count }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 1.1 + Math.random() * 1.7,
      color: palette[idx % palette.length],
      phase: Math.random() * Math.PI * 2
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
    if (reducedMotion) {
      renderFrame(0);
    }
  }

  function renderFrame(time) {
    ctx.clearRect(0, 0, width, height);

    const linkDist = width < 768 ? 110 : 148;
    const mouseDist = 175;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      if (!reducedMotion) {
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 14 && dist < mouseDist) {
            const pull = (1 - dist / mouseDist) * 0.012;
            p.vx += (dx / dist) * pull;
            p.vy += (dy / dist) * pull;
          }
        }

        // 輕微阻尼避免速度累積過快
        p.vx *= 0.992;
        p.vy *= 0.992;

        // 保持微弱漂移
        const speed = Math.hypot(p.vx, p.vy);
        if (speed < 0.08) {
          p.vx += (Math.random() - 0.5) * 0.04;
          p.vy += (Math.random() - 0.5) * 0.04;
        } else if (speed > 0.65) {
          p.vx = (p.vx / speed) * 0.65;
          p.vy = (p.vy / speed) * 0.65;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      // 粒子間分子鍵連線
      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.16;
          ctx.strokeStyle = `rgba(110, 198, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // 滑鼠微弱引力連線
      if (mouse.active) {
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mDist = Math.hypot(mdx, mdy);
        if (mDist < mouseDist) {
          const alpha = (1 - mDist / mouseDist) * 0.28;
          ctx.strokeStyle = `rgba(0, 230, 118, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // 粒子節點
      const pulse = reducedMotion ? 1 : 0.78 + 0.22 * Math.sin(time * 0.0018 + p.phase);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(renderFrame);
    }
  }

  function handleMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function handleMouseLeave() {
    mouse.active = false;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

  if (!reducedMotion) {
    rafId = window.requestAnimationFrame(renderFrame);
  }

  return () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
  };
}
