# Personalized Parametric EQ

PPEQ is a web app that builds a custom 10-band parametric EQ profile based on listening preferences.

Instead of asking traditional quiz questions, the app plays multiple EQ-processed variations of the same audio and lets the user choose what sounds best. The final EQ curve, filter types, Q factors, and preamp are then generated automatically.

## What It Does

- Runs a 7-step audio preference quiz with 4 options per step
- Derives a personalized 10-band EQ profile from user selections
- Automatically assigns:
  - Gain per band
  - Filter type per band (Peak, Low Shelf, High Shelf)
  - Q factor per band
  - Safe default preamp to reduce clipping risk
- Allows manual fine-tuning after quiz completion
- Shows a real-time frequency response graph
- Displays filter settings in a readable table
- Exports settings to a text format compatible with manual EQ entry workflows
- Users can either:
  - Use the bundled default sample audio (Credits to NULLPX)
  - Upload their own audio file

## How To Use

1. Open the app.
2. Choose default sample audio or upload your own file.
3. Complete the 7 quiz steps by selecting preferred sound variations.
4. Review generated EQ settings.
5. Fine-tune preamp, gain, Q, and filter types if needed.
6. Export settings.

## Export Format

The app exports plain text in this style:

```text
Preamp: -3.3 dB
Filter 1: ON PK Fc 90 Hz Gain -9.5 dB Q 0.25
Filter 2: ON LSC Fc 110 Hz Gain 5.0 dB Q 0.71
...
```

## Tech Stack

- React
- TypeScript
- Vite
- Web Audio API
- CSS

## Project Structure

- src/components: UI components (quiz flow, EQ panel, graph, media bar)
- src/services: audio engine, quiz logic, filter math, exporter
- src/audio: bundled default audio sample

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```



## Note
### Actual perceived results depend on source material, playback chain, and listening environment.

## License

This project is licensed under the GPL-3.0 license.
