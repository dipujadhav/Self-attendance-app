# Passport Photo Generator 📸

A dedicated Passport Photo Generator project for preparing clean, print-ready passport photo previews. The repository now represents only the passport photo workflow.

## What this project does

- Accepts a portrait image in the browser.
- Displays it inside a 26 x 31 mm passport-photo preview frame.
- Uses a pure white canvas with a thin black border for print trimming guidance.
- Exports a PNG sized for 300 DPI output.
- Provides a clean React + Vite foundation for future passport-photo engine milestones.

## Project scope

This repository is dedicated to Passport Photo Generator functionality only, with a clean structure focused on passport-photo preparation and export milestones.

## Planned milestones

1. **Core passport photo engine**: background removal, face detection, alignment, centering, and 26 x 31 mm output.
2. **Manual preview controls**: crop, zoom, rotate, and reposition.
3. **Print exports**: A4 portrait sheets, 12-photo layout, PDF export, and JPG export.
4. **Polish**: multiple people per sheet, performance improvements, and production-ready UX.

## Technology stack

- React 19
- Vite
- TypeScript
- Tailwind CSS via CDN for the current lightweight prototype
- Lucide React icons

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is emitted to `dist/`.
