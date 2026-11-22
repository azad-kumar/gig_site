# Azad Kumar — Data Analyst & Data Scientist Portfolio

A clean, fast, accessible static portfolio site built with plain HTML/CSS/JS. Hosted on GitHub Pages.

## 🌐 Live Site
[https://azadkumar.in](https://azadkumar.in) *(or your GitHub Pages URL)*

## 📁 Project Structure
```
├── index.html           # Main landing page
├── style.css            # All styles (responsive, dark/light, animations)
├── script.js            # Interactions (counter, scroll reveals, dashboard)
├── .nojekyll            # Disables Jekyll processing on GitHub Pages
├── assets/
│   └── profile/
│       └── main.webp    # Profile photo
├── projects/
│   ├── credit-risk.html        # ML classification case study
│   ├── dynamic-pricing.html    # Pricing optimization case study
│   └── supply-chain.html       # BI dashboard case study
└── fonts/               # Self-hosted fonts (Eightgon, Techbit)
```

## ✨ Features
- **Single-page layout** with hero, about/experience, interactive insights dashboard, skills, projects, contact
- **Interactive "Data Reveal" section** — raw spreadsheet scroll-reveals into a full e-commerce dashboard (KPIs, charts, donut, bars, country rankings)
- **Resume-derived skill chips** — 20+ technologies grouped by category
- **Three detailed case-study pages** with problem/solution/stack/results structure
- **Responsive** — mobile-first, works at all breakpoints
- **Accessible** — semantic HTML, ARIA labels, WCAG AA contrast, reduced-motion support
- **SEO-ready** — meta tags, Open Graph, JSON-LD Person schema
- **Performance** — no frameworks, self-hosted fonts, WebP images, `defer` scripts
- **Dark/light theme** — respects `prefers-color-scheme`, no flash

## 🛠 Tech Stack
| Category | Tools |
|----------|-------|
| **Languages** | HTML5, CSS3 (custom properties, container queries), Vanilla JS (ES modules) |
| **Styling** | CSS Grid/Flex, fluid type (`clamp()`), `@layer` cascade, `prefers-reduced-motion` |
| **Fonts** | Archivo (display), Instrument Serif (editorial), JetBrains Mono (code) — self-hosted via `font-display: swap` |
| **Icons** | Inline SVG only |
| **Hosting** | GitHub Pages (static, no build step) |

## 🚀 Deploy to GitHub Pages
1. Push `main` branch to GitHub
2. Repo → **Settings → Pages** → Source: *Deploy from branch* → `main` / `(root)`
3. (Optional) Add custom domain in **Settings → Pages → Custom domain** + `CNAME` file

> The `.nojekyll` file is already included — GitHub Pages will serve files as-is.

## 📝 Customization
- **Copy/content**: Edit `index.html` and `projects/*.html`
- **Colors/typography**: Modify CSS custom properties in `style.css:1-80`
- **Profile photo**: Replace `assets/profile/main.webp` (keep WebP, ≤100 KB)
- **Projects**: Add/remove `.html` files in `projects/` and update the grid in `index.html`

## 📄 License
MIT — free to use as a template for your own portfolio.

---

*Built with plain web standards. No frameworks, no build step, no dependencies.*