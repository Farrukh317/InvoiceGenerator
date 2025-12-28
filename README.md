<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# React Invoice Builder (Vite)

This repository is a small React + TypeScript app built with Vite that provides an invoice builder UI and PDF export.

## Project Overview

- Framework: React (v19)
- Bundler: Vite
- Language: TypeScript
- Purpose: Build and preview invoices in the browser and export as PDF using `jspdf` + `html2canvas`.

## Prerequisites

- Node.js 18 or newer (recommended)
- npm (or use `pnpm`/`yarn` if you prefer)

## Quick Start

1. Install dependencies:

```powershell
npm install
```

2. Start the development server:

```powershell
npm run dev
```

The dev server defaults to port `3000` per `vite.config.ts`.

3. Build for production:

```powershell
npm run build
```

4. Preview a production build locally:

```powershell
npm run preview
```

## Available npm scripts

- `dev` — Run Vite dev server
- `build` — Build production assets with Vite
- `preview` — Preview the production build locally

(See `package.json` for exact script definitions.)

## Environment variables

`vite.config.ts` reads `INVOICE_API_KEY` from the environment and defines it as `process.env.INVOICE_API_KEY` for the client. If your usage requires it, create a `.env` or `.env.local` file with:

```env
INVOICE_API_KEY=your_api_key_here
```

Note: this project does not include server-side secret handling — do not commit secret keys to the repo.

## Project Structure (key files)

- `index.html` — App shell and import map; includes CDN scripts for `jspdf` and `html2canvas`.
- `index.tsx` — React entry, components, invoice logic, and PDF export.
- `vite.config.ts` — Vite config (server port, env injection, React plugin).
- `tsconfig.json` — TypeScript config.
- `package.json` — Scripts and dependency list.
- `metadata.json` — Metadata for deployment/AI Studio.

## Notes & Troubleshooting

- If `npm run dev` fails with exit code 1:
  - Ensure you ran `npm install` first.
  - Verify Node.js version with `node -v` (use Node 18+).
  - If port 3000 is in use, change `server.port` in `vite.config.ts` or run `npm run dev -- --port 5173`.

- If TypeScript shows errors in the editor but the app still runs, Vite's dev server may still start; fix the TypeScript errors or adjust `tsconfig.json` settings if needed.

- The HTML imports `jspdf` and `html2canvas` from CDN; if you prefer bundling them, install the packages and import them from `node_modules`.

## How the app generates PDFs

- The app captures the invoice preview DOM using `html2canvas` then creates a PDF via `jspdf`.
- The scripts are included in `index.html` via CDN; the TypeScript code accesses them via the `window` object.
