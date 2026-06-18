/* ════════════════════════════════════════════════════
   PORTFOLIO — script.js  |  Md Furkan Alam
   3D Premium Edition
════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   0. AURORA BACKGROUND ANIMATION
───────────────────────────────────────────── */
(function initAurora() {
  const canvas = document.getElementById('aurora-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Blobs — each is a large glowing circle that drifts slowly
  const blobs = [
    { x: 0.15, y: 0.12, r: 0.52, dx: 0.00018, dy: 0.00012, color: 'rgba(212,168,83,ALPHA)',   alpha: 0.14 },
    { x: 0.80, y: 0.75, r: 0.48, dx:-0.00015, dy:-0.00010, color: 'rgba(107,70,193,ALPHA)',    alpha: 0.09 },
    { x: 0.50, y: 0.45, r: 0.38, dx: 0.00010, dy: 0.00018, color: 'rgba(14,124,106,ALPHA)',    alpha: 0.07 },
    { x: 0.85, y: 0.18, r: 0.30, dx:-0.00020, dy: 0.00014, color: 'rgba(244,114,182,ALPHA)',   alpha: 0.07 },
    { x: 0.20, y: 0.80, r: 0.28, dx: 0.00016, dy:-0.00012, color: 'rgba(97,218,251,ALPHA)',    alpha: 0.06 },
    { x: 0.60, y: 0.10, r: 0.22, dx:-0.00012, dy: 0.00016, color: 'rgba(251,146,60,ALPHA)',    alpha: 0.06 },
  ];

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    blobs.forEach(b => {
      // Gentle sine drift
      const nx = (b.x + Math.sin(t * b.dx * 1000 + b.alpha * 10) * 0.12) * W;
      const ny = (b.y + Math.cos(t * b.dy * 1000 + b.alpha * 5)  * 0.10) * H;
      const r  = b.r * Math.min(W, H);

      const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
      const col  = b.color.replace('ALPHA', b.alpha.toString());
      const col0 = b.color.replace('ALPHA', '0');
      grad.addColorStop(0, col);
      grad.addColorStop(0.5, b.color.replace('ALPHA', (b.alpha * 0.4).toString()));
      grad.addColorStop(1, col0);

      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    t += 1;
    requestAnimationFrame(draw);
  }
  draw();
})();



/* ─────────────────────────────────────────────
   1. 3D PARTICLE CANVAS BACKGROUND
───────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: W / 2, y: H / 2 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Particle class
  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.z  = Math.random();                      // depth 0..1
      this.r  = (0.4 + this.z * 1.6);               // radius by depth
      this.vx = (Math.random() - 0.5) * 0.25 * this.z;
      this.vy = -(0.15 + Math.random() * 0.35) * this.z;
      // Gold or violet or white
      const palettes = [
        `rgba(150,104,15,${0.18 + this.z * 0.32})`,   // warm gold
        `rgba(107,70,193,${0.12 + this.z * 0.22})`,   // soft violet
        `rgba(14,124,106,${0.10 + this.z * 0.18})`,   // teal
        `rgba(120,90,40,${0.10 + this.z * 0.16})`,    // amber brown
      ];
      this.color = palettes[Math.floor(Math.random() * palettes.length)];
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.01 + Math.random() * 0.02;
    }
    update() {
      this.twinkle += this.twinkleSpeed;
      const parallaxX = (mouse.x / W - 0.5) * 0.8 * this.z;
      const parallaxY = (mouse.y / H - 0.5) * 0.8 * this.z;
      this.x += this.vx + parallaxX * 0.02;
      this.y += this.vy + parallaxY * 0.02;
      if (this.y < -10 || this.x < -20 || this.x > W + 20) this.reset();
    }
    draw() {
      const alpha = 0.5 + 0.5 * Math.sin(this.twinkle);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      // Glow for larger particles
      if (this.r > 1.2) {
        ctx.shadowBlur  = 8 * this.z;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Spawn particles
  const COUNT = Math.min(220, Math.floor((W * H) / 5000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Draw connecting lines between close particles
  function drawLines() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const alpha = (1 - d / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(150,104,15,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }
  loop();
})();


/* ─────────────────────────────────────────────
   2. CUSTOM CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  if (!dot || !ring) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a,button,.proj-card,.sk-card,.learn-card,.edu-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ─────────────────────────────────────────────
   3. NAV — SHRINK ON SCROLL + ACTIVE LINK
───────────────────────────────────────────── */
(function initNav() {
  const nav   = document.getElementById('main-nav');
  const links = document.querySelectorAll('.nav-link');

  const update = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    const pos = window.scrollY + 120;
    links.forEach(l => {
      const sec = document.querySelector(l.getAttribute('href'));
      if (!sec) return;
      l.classList.toggle('active', pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight);
    });
  };
  window.addEventListener('scroll', update, { passive: true });
  update();

  links.forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(l.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nav-links').classList.remove('open');
      document.getElementById('hamburger').classList.remove('open');
    });
  });
})();


/* ─────────────────────────────────────────────
   4. HAMBURGER
───────────────────────────────────────────── */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-links');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
    }
  });
})();


/* ─────────────────────────────────────────────
   5. SCROLL REVEAL
───────────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = (idx % 6) * 0.08 + 's';
      entry.target.classList.add('in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────
   6. 3D TILT CARDS  (mouse-track per card)
───────────────────────────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    let bounds;

    const refresh = () => { bounds = card.getBoundingClientRect(); };
    card.addEventListener('mouseenter', refresh);

    card.addEventListener('mousemove', e => {
      if (!bounds) refresh();
      const cx = bounds.left + bounds.width  / 2;
      const cy = bounds.top  + bounds.height / 2;
      const rx = ((e.clientY - cy) / (bounds.height / 2)) * -9;  // tilt X
      const ry = ((e.clientX - cx) / (bounds.width  / 2)) *  9;  // tilt Y
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      card.style.transition = 'transform 0.08s';

      // Sheen highlight
      const px = ((e.clientX - bounds.left) / bounds.width  * 100).toFixed(1);
      const py = ((e.clientY - bounds.top)  / bounds.height * 100).toFixed(1);
      card.style.setProperty('--mx', px + '%');
      card.style.setProperty('--my', py + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.55s cubic-bezier(.17,.84,.44,1)';
    });
  });
})();


/* ─────────────────────────────────────────────
   7. ABOUT CARD — 3D mouse tilt (separate)
───────────────────────────────────────────── */
(function initAbout3D() {
  const wrap  = document.getElementById('about-card-3d');
  const inner = document.getElementById('about-card-inner');
  if (!wrap || !inner) return;

  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const rx = ((e.clientY - cy) / (r.height / 2)) * -12;
    const ry = ((e.clientX - cx) / (r.width  / 2)) *  12;
    inner.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
    inner.style.transition = 'transform 0.08s';
    inner.style.boxShadow  = `${-ry * 1.5}px ${rx * 1.5}px 60px rgba(0,0,0,0.55), 0 0 50px rgba(212,168,83,0.12)`;
  });
  wrap.addEventListener('mouseleave', () => {
    inner.style.transform  = '';
    inner.style.transition = 'transform 0.6s cubic-bezier(.17,.84,.44,1)';
    inner.style.boxShadow  = '';
  });
})();


/* ─────────────────────────────────────────────
   8. ANIMATED COUNTER (hero)
───────────────────────────────────────────── */
(function initCounters() {
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const counters = document.querySelectorAll('[data-count]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = +el.dataset.count;
      let start;
      (function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1300, 1);
        el.textContent = Math.round(easeOut(p) * end) + '+';
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────
   9. LEARNING PROGRESS BARS
───────────────────────────────────────────── */
(function initBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.width = (e.target.dataset.width || 0) + '%';
      obs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.learn-bar').forEach(b => obs.observe(b));
})();


/* ─────────────────────────────────────────────
   10. BLOB PARALLAX ON SCROLL
───────────────────────────────────────────── */
(function initParallax() {
  const blobs = document.querySelectorAll('.hero-blob');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        blobs.forEach((b, i) => {
          b.style.transform = `translateY(${y * (0.04 + i * 0.025)}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ─────────────────────────────────────────────
   11. MAGNETIC BUTTONS
───────────────────────────────────────────── */
(function initMagnetic() {
  document.querySelectorAll('.btn-p, .nav-cta, .contact-email-btn, .btn-resume').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.22;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.22;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();


/* ─────────────────────────────────────────────
   12. SCROLL HINT FADE
───────────────────────────────────────────── */
(function initScrollHint() {
  const hint = document.getElementById('hero-scroll-hint');
  if (!hint) return;
  const hide = () => {
    if (window.scrollY > 100) {
      hint.style.opacity = '0';
      hint.style.pointerEvents = 'none';
      window.removeEventListener('scroll', hide);
    }
  };
  window.addEventListener('scroll', hide, { passive: true });
})();


/* ─────────────────────────────────────────────
   13. COPY EMAIL (contact button)
───────────────────────────────────────────── */
(function initCopyEmail() {
  const btn = document.getElementById('contact-email-btn');
  if (!btn) return;
  btn.addEventListener('click', async e => {
    e.preventDefault();
    const email = 'furkan210807@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      const orig = btn.innerHTML;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Copied to clipboard!`;
      btn.style.background = 'linear-gradient(135deg,#1a7f64,#2dd4bf)';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
})();


/* ─────────────────────────────────────────────
   14. FOOTER YEAR
───────────────────────────────────────────── */
(function initYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────────
   15. SECTION ENTRANCE TEXT SPLIT (headings)
───────────────────────────────────────────── */
(function initHeadingGlow() {
  // Subtle shimmer animation trigger on s-title when it enters viewport
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.textShadow = '0 0 60px rgba(212,168,83,0.12)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.s-title').forEach(h => obs.observe(h));
})();


/* ─────────────────────────────────────────────
   16. HERO H1 LETTER SHIMMER (on load)
───────────────────────────────────────────── */
(function initHeroShimmer() {
  const line = document.querySelector('.h1-line1');
  if (!line) return;
  setTimeout(() => {
    line.style.filter = 'drop-shadow(0 0 40px rgba(212,168,83,0.5))';
    setTimeout(() => {
      line.style.filter = 'drop-shadow(0 0 30px rgba(212,168,83,0.3))';
    }, 700);
  }, 1000);
})();


/* ─────────────────────────────────────────────
   17. PARTICLES BACKGROUND
───────────────────────────────────────────── */
if (typeof particlesJS !== 'undefined') {
  particlesJS("particles-js", {
    "particles": {
      "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
      "color": { "value": "#d4a853" },
      "shape": { "type": "circle" },
      "opacity": { "value": 0.3, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
      "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } },
      "line_linked": { "enable": true, "distance": 150, "color": "#d4a853", "opacity": 0.1, "width": 1 },
      "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true },
      "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.3 } } }
    },
    "retina_detect": true
  });
}

/* ─────────────────────────────────────────────
   18. CONFETTI ON RESUME DOWNLOAD
───────────────────────────────────────────── */
const resumeBtns = document.querySelectorAll('.btn-resume');
resumeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // don't prevent default, let the download happen
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4a853', '#ffffff', '#2dd4bf']
      });
    }
  });
});
