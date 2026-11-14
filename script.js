// ---------------------------------------------------------------
// Footer year
// ---------------------------------------------------------------
const currentYear = new Date().getFullYear();
document.getElementById("year").textContent = currentYear;
const yearZh = document.getElementById("year-zh");
if (yearZh) yearZh.textContent = currentYear;

// ---------------------------------------------------------------
// Language toggle (EN / Traditional Chinese)
// ---------------------------------------------------------------
(function () {
  const buttons = document.querySelectorAll(".lang-switch__btn");
  const root = document.documentElement;
  const titles = {
    en: root.dataset.titleEn || document.title,
    zh: root.dataset.titleZh || document.title,
  };
  const metaDescEl = document.querySelector('meta[name="description"]');
  const descriptions = {
    en: root.dataset.descEn || (metaDescEl ? metaDescEl.getAttribute("content") : ""),
    zh: root.dataset.descZh || (metaDescEl ? metaDescEl.getAttribute("content") : ""),
  };

  function setLang(lang) {
    const isZh = lang === "zh";
    document.documentElement.classList.toggle("lang-zh", isZh);
    document.documentElement.setAttribute("lang", isZh ? "zh-Hant" : "en");
    document.title = titles[isZh ? "zh" : "en"];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", descriptions[isZh ? "zh" : "en"]);
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    try {
      localStorage.setItem("site-lang", lang);
    } catch (e) {
      /* ignore (private browsing, etc.) */
    }
  }

  buttons.forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  let saved = null;
  try {
    saved = localStorage.getItem("site-lang");
  } catch (e) {
    /* ignore */
  }
  setLang(saved === "zh" ? "zh" : "en");
})();

// ---------------------------------------------------------------
// Scroll-reveal for sections
// ---------------------------------------------------------------
const sections = document.querySelectorAll(".section");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
sections.forEach((s) => io.observe(s));

// ---------------------------------------------------------------
// Hero background: a static stretched-and-folded line field,
// drawn once (and redrawn only on resize). No animation.
// ---------------------------------------------------------------
const canvas = document.getElementById("flow-canvas");
const ctx = canvas.getContext("2d");

function drawHero() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const count = Math.max(10, Math.floor(width / 90));
  for (let i = 0; i < count; i++) {
    // Deterministic per-strand parameters so the pattern is stable.
    const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const r2 = (Math.sin(i * 78.233) * 12345.6789) % 1;
    const baseY = (height / (count + 1)) * (i + 1);
    const freq = 0.0035 + Math.abs(r1) * 0.0035;
    const amp = 22 + Math.abs(r2) * 36;
    const phase = Math.abs(r1 + r2) * Math.PI * 2;
    const fold = 0.4 + Math.abs(r2) * 0.8;

    ctx.beginPath();
    for (let x = -20; x <= width + 20; x += 6) {
      const y =
        baseY +
        Math.sin(x * freq + phase) * amp +
        Math.sin(x * freq * 2.6 + phase) * amp * 0.35 * fold;
      if (x === -20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 2 === 0 ? "rgba(200,155,60,0.85)" : "rgba(63,143,134,0.85)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
}

window.addEventListener("resize", drawHero);
drawHero();

// ---------------------------------------------------------------
// Experience-section jet background: the actual thesis-cover jet
// graphic, parallax-shifted as you scroll past the section — a
// direct, physical response to scrolling rather than a continuous
// animation loop.
// ---------------------------------------------------------------
const jetBg = document.getElementById("jet-bg");
const jetSection = document.getElementById("experience");

if (jetBg && jetSection) {
  let parallaxQueued = false;

  const updateParallax = () => {
    parallaxQueued = false;
    const rect = jetSection.getBoundingClientRect();
    const vh = window.innerHeight;
    // progress: ~-1 when section is below the viewport, 0 when
    // centered in it, ~+1 once it has scrolled past above.
    const progress = (vh * 0.5 - (rect.top + rect.height * 0.5)) / (vh * 0.5 + rect.height * 0.5);
    const clamped = Math.max(-1.3, Math.min(1.3, progress));
    const translateY = clamped * 50; // px of vertical drift
    const scale = 1 + Math.abs(clamped) * 0.05;
    jetBg.style.transform = `translate(-50%, calc(-50% + ${translateY.toFixed(1)}px)) scale(${scale.toFixed(3)})`;
  };

  const queueParallax = () => {
    if (!parallaxQueued) {
      parallaxQueued = true;
      requestAnimationFrame(updateParallax);
    }
  };

  window.addEventListener("scroll", queueParallax, { passive: true });
  window.addEventListener("resize", queueParallax);
  updateParallax();
}
