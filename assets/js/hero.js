/* ============================================================
   Homepage hero — scroll-scrubbed leveraged recap build
   GSAP + ScrollTrigger (CDN). Reversible on scroll-up.
   Falls back to a static end-state for prefers-reduced-motion,
   and to simple staged fade-ins on small screens.
   ============================================================ */

/* ------------------------------------------------------------
   CONFIG — real figures from the Costco recap deck.
   ------------------------------------------------------------ */
const HERO_CONFIG = {
  usePlaceholders: false,

  newDebtBillions: 5.0,  // $5.0B IG notes at 5.5%
  waccBeforePct: 7.79,
  waccAfterPct: 6.7,     // ≈, at an illustrative 80/20 D/E ceiling — not the $5B case
  epsImpactPct: -1.43,   // EPS-DILUTIVE at $5B (offset by +$1.25B PV tax shield)

  // Visual proportion of the stacked bar the debt tranche fills.
  // Deliberately NOT to scale — actual pro forma leverage is only
  // 0.5x Debt/EBITDA, which would render as a sliver. The bar is
  // labeled "illustrative" on the page.
  debtShareOfBar: 0.2,

  takeaway: "Value-accretive. Culturally unlikely.",
};

const FILL_IN = "[FILL IN]";

(function () {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const els = {
    captions: hero.querySelectorAll(".caption"),
    takeaway: hero.querySelector(".hero-takeaway"),
    debtSeg: hero.querySelector(".seg-debt"),
    debtLabel: hero.querySelector(".seg-debt .seg-label"),
    stats: hero.querySelectorAll(".stat"),
    vDebt: document.getElementById("v-debt"),
    vWacc: document.getElementById("v-wacc"),
    vEps: document.getElementById("v-eps"),
    cue: hero.querySelector(".scroll-cue"),
    viz: hero.querySelector(".hero-viz"),
    copy: hero.querySelector(".hero-copy"),
  };

  els.takeaway.textContent = HERO_CONFIG.takeaway;

  const fmtDebt = (n) => "$" + n.toFixed(1) + "B";
  const fmtWaccBefore = HERO_CONFIG.waccBeforePct.toFixed(2) + "%";
  const fmtWaccAfter = (n) => "≈" + n.toFixed(1) + "%"; // ≈ — illustrative ceiling
  const fmtEps = (n) =>
    (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(2) + "%";
  const debtPct = HERO_CONFIG.debtShareOfBar * 100;

  function setFinalNumbers() {
    if (HERO_CONFIG.usePlaceholders) {
      els.vDebt.textContent = FILL_IN;
      els.vWacc.textContent = FILL_IN + " → " + FILL_IN;
      els.vEps.textContent = FILL_IN;
    } else {
      els.vDebt.textContent = fmtDebt(HERO_CONFIG.newDebtBillions);
      els.vWacc.textContent =
        fmtWaccBefore + " → " + fmtWaccAfter(HERO_CONFIG.waccAfterPct);
      els.vEps.textContent = fmtEps(HERO_CONFIG.epsImpactPct);
    }
  }

  /* ---------- Fallback 1: static end-state ---------- */
  function staticMode() {
    hero.classList.add("hero-static");
    els.debtSeg.style.height = debtPct + "%";
    setFinalNumbers();
  }

  /* ---------- Fallback 2: simplified mobile (staged fade-ins) ---------- */
  function simpleMode() {
    hero.classList.add("hero-simple");
    setFinalNumbers();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          if (e.target === els.viz) {
            els.debtSeg.style.height = debtPct + "%"; // CSS-transitioned
          }
          io.unobserve(e.target);
        });
      },
      { threshold: 0.2 }
    );
    io.observe(els.viz);
    io.observe(els.copy);
  }

  /* ---------- Full mode: pinned, scroll-scrubbed GSAP timeline ---------- */
  function scrubMode() {
    gsap.registerPlugin(ScrollTrigger);

    // Proxy object the timeline tweens; onUpdate writes formatted text.
    const counters = { debt: 0, wacc: HERO_CONFIG.waccBeforePct, eps: 0 };
    const ph = HERO_CONFIG.usePlaceholders;
    if (ph) setFinalNumbers(); // counters show [FILL IN]; tiles still animate in
    else {
      els.vDebt.textContent = fmtDebt(0);
      els.vWacc.textContent = fmtWaccBefore;
      els.vEps.textContent = fmtEps(0);
    }

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=150%",
        scrub: true,
        pin: true,
      },
    });

    const caption = (i) => els.captions[i];
    const stat = (i) => els.stats[i];

    tl
      // Stage 1 -> 2: swap caption, grow debt tranche, tick counter
      .to(caption(0), { opacity: 0, duration: 0.08 }, 0.1)
      .to(caption(1), { opacity: 1, duration: 0.08 }, 0.18)
      .to(els.debtSeg, { height: debtPct + "%", duration: 0.3 }, 0.18)
      .to(stat(0), { opacity: 1, y: 0, duration: 0.1 }, 0.2)
      .to(els.debtLabel, { opacity: 1, duration: 0.08 }, 0.4)

      // Stage 3: WACC re-weights
      .to(caption(1), { opacity: 0, duration: 0.08 }, 0.48)
      .to(caption(2), { opacity: 1, duration: 0.08 }, 0.56)
      .to(stat(1), { opacity: 1, y: 0, duration: 0.1 }, 0.56)

      // Stage 4: EPS impact counts (down — the $5B case is dilutive)
      .to(caption(2), { opacity: 0, duration: 0.08 }, 0.7)
      .to(caption(3), { opacity: 1, duration: 0.08 }, 0.78)
      .to(stat(2), { opacity: 1, y: 0, duration: 0.1 }, 0.78)

      // Stage 5: resting state + takeaway
      .to(els.takeaway, { opacity: 1, duration: 0.12 }, 0.9)
      .to(els.cue, { opacity: 0, duration: 0.1 }, 0.15);

    if (!ph) {
      tl.to(
        counters,
        {
          debt: HERO_CONFIG.newDebtBillions,
          duration: 0.3,
          onUpdate: () => (els.vDebt.textContent = fmtDebt(counters.debt)),
        },
        0.18
      )
        .to(
          counters,
          {
            wacc: HERO_CONFIG.waccAfterPct,
            duration: 0.14,
            onUpdate: () =>
              (els.vWacc.textContent =
                fmtWaccBefore + " → " + fmtWaccAfter(counters.wacc)),
          },
          0.56
        )
        .to(
          counters,
          {
            eps: HERO_CONFIG.epsImpactPct,
            duration: 0.14,
            onUpdate: () => (els.vEps.textContent = fmtEps(counters.eps)),
          },
          0.78
        );
    }
  }

  /* ---------- Mode selection ---------- */
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const smallScreen = window.matchMedia("(max-width: 860px)").matches;
  const gsapReady = !!(window.gsap && window.ScrollTrigger);

  if (reducedMotion || !gsapReady) staticMode();
  else if (smallScreen) simpleMode();
  else scrubMode();
})();
