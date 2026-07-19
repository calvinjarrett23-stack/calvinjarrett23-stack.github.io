# calvinjarrett.site — personal portfolio

Plain HTML/CSS/JS static site for GitHub Pages. No build step.

## Structure

```
index.html                       Home — scroll-scrubbed recap hero + entry tiles
academics/                       Section landing
  costco/                        Costco leveraged recapitalization case study
ibm/                             Section landing
  nexus/                         NEXUS case study
  predictive-cash-flow/          Client / Oracle EPM case study (client unnamed publicly)
independent/                     weduediligence.com case study
contact/                         Email / LinkedIn / resume
assets/css/site.css              Shared design system
assets/js/hero.js                Hero animation (GSAP + ScrollTrigger via CDN)
assets/docs/                     Costco deck (embedded PDF + downloadable PPTX)
assets/img/                      Screenshots (weduediligence embed; NEXUS gallery)
```

All links are relative, so the site works both as a user site
(`username.github.io`) and a project site (`username.github.io/repo`).

## Deploy to GitHub Pages

1. `git init && git add -A && git commit -m "Initial site"`
2. Push to a GitHub repo (`<username>.github.io` for a root-domain user site,
   or any repo name for a project site).
3. Repo → Settings → Pages → Source: "Deploy from a branch" → `main` / `/ (root)`.

## Notes

- **NEXUS screenshots**: a ready-made gallery is commented out in
  `ibm/nexus/index.html` — drop images into `assets/img/` and uncomment,
  one `<figure>` per screenshot.
- **Costco deck**: the page embeds `assets/docs/costco-levered-recap.pdf`
  (exported from the PPTX); both files are offered as downloads. If the deck
  changes, re-export the PDF and replace both.
- All case-study content, hero numbers, and the resume PDF are in. The hero's
  `debtShareOfBar` (in `assets/js/hero.js`) is deliberately not to scale —
  actual pro forma leverage is 0.5x Debt/EBITDA, which would render as a
  sliver; the bar is labeled "illustrative" on the page.

## Editing notes

- The nav is duplicated in each page (no build step); the active page gets
  `aria-current="page"` on its link. Update all pages if the nav changes.
- Hero honors `prefers-reduced-motion` (static end-state), degrades to staged
  fade-ins under 860px, and falls back to static if the GSAP CDN fails or JS
  is disabled.
- Palette: accent/debt `#177a5b`, equity `#2f6db8` — the pair is
  colorblind-validated against the `#faf9f7` background; keep direct labels
  on the bar segments if you change colors.
