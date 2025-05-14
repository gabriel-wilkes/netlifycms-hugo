# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the codebase for [Azul Technology](https://azul.technology), a personal portfolio and business website for Gabriel Wilkes. The site is built with:

- [Hugo](https://gohugo.io/) - Static site generator
- [Netlify CMS](https://github.com/netlify/netlify-cms) - Content management
- Webpack - Asset bundling
- React - For the CMS interface

The website is hosted on Netlify with automatic deployments from git.

## Project Structure

- `/site` - Hugo site content and configuration
  - `/content` - Markdown content for pages (blog, portfolio, uses)
  - `/layouts` - HTML templates
  - `/static` - Static assets (CSS, JS, images)
- `/src` - Source files for the CMS and frontend
  - `/js` - JavaScript files including CMS customization
  - `/css` - CSS files
- `/webpack.*.js` - Webpack configuration files

## Development Commands

### Setup

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server (Hugo + Webpack)
npm start

# Lint JavaScript
npm run lint

# Preview production build
npm run preview
```

### Building

```bash
# Build for production
npm run build

# Build for preview (includes drafts and future content)
npm run build:preview
```

## Hugo Compatibility Notes

- The site was upgraded from Hugo 0.55.6 to 0.144.3+
- These changes were required for compatibility:
  1. Google Analytics implementation now uses a custom partial (`/site/layouts/partials/google-analytics.html`)
  2. `.Hugo.Generator` changed to `hugo.Generator` in templates
  3. Google Analytics ID moved from `googleAnalytics` site parameter to `params.googleAnalytics`

## Notes

- The site uses the Forty Hugo theme
- Content editing can be done via:
  1. Direct Git workflow
  2. Forestry.io
  3. Netlify CMS (partial support)
- The site automatically deploys to Netlify when changes are pushed to the repository
- Sass deprecation warnings appear during build but don't affect functionality