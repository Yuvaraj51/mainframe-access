/*
  login-effects.js
  Visual flourishes for the login page:
    1. An interactive particle constellation drifting behind the card
    2. A 3D tilt + glass "sheen" highlight on the card that follows the cursor

  Both respect prefers-reduced-motion and degrade gracefully on touch devices.
  This file is purely decorative — form validation lives in login.js.
*/

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Particle constellation ---------- */
  function initConstellation() {
    const canvas = document.getElementById("constellation");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const palette = ["45, 212, 191", "129, 140, 248", "168, 85, 247"]; // teal, indigo, purple
    let particles = [];
    let mouse = { x: null, y: null };
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(70, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: palette[Math.floor(Math.random() * palette.length)],
        r: 1 + Math.random() * 1.5,
      }));
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, 0.7)`;
        ctx.fill();
      });

      const linkDist = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${a.color}, ${0.18 * (1 - dist / linkDist)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          const dist = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
          const reach = linkDist * 1.3;
          if (dist < reach) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${particles[i].color}, ${0.28 * (1 - dist / reach)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function step() {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });
      drawFrame();
      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    createParticles();
    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("mouseout", () => {
      mouse.x = null;
      mouse.y = null;
    });

    if (reduceMotion) {
      drawFrame();
    } else {
      step();
    }
  }

  /* ---------- Card tilt + glass sheen ---------- */
  function initCardTilt() {
    const card = document.querySelector(".login-card");
    const sheen = document.querySelector(".card-sheen");
    if (!card || !canHover || reduceMotion) return;

    const maxTilt = 6;

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      if (sheen) {
        sheen.style.setProperty("--mx", `${px * 100}%`);
        sheen.style.setProperty("--my", `${py * 100}%`);
        sheen.style.opacity = "1";
      }
    }

    function onLeave() {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
      if (sheen) sheen.style.opacity = "0";
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initConstellation();
      initCardTilt();
    });
  } else {
    initConstellation();
    initCardTilt();
  }
})();