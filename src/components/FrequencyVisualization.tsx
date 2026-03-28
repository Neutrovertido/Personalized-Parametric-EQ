import { useEffect, useRef } from 'react';
import { generateFrequencyResponse } from '../services/filterMath';
import type { EQProfile } from '../services/filterMath';
import { getAudioEngine } from '../services/audioEngine';
import './FrequencyVisualization.css';

interface FrequencyVisualizationProps {
  profile: EQProfile;
}

export default function FrequencyVisualization({
  profile,
}: FrequencyVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioEngine = getAudioEngine();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const sampleRate = audioEngine.getSampleRate();

    // Generate frequency response
    const frequencyResponse = generateFrequencyResponse(profile, sampleRate, 512);

    // Drawing parameters
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const minDb = -24;
    const maxDb = 24;
    const dbRange = maxDb - minDb;
    const maxGraphFreq = Math.min(sampleRate / 2, 20000);

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    // Horizontal grid (dB lines)
    for (let db = minDb; db <= maxDb; db += 6) {
      const y = padding + (maxDb - db) * (graphHeight / dbRange);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${db}dB`, padding - 8, y + 4);
    }

    // Vertical grid (frequency lines, logarithmic)
    const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    for (const freq of freqs) {
      if (freq > maxGraphFreq) continue;
      const logFreq = Math.log10(freq);
      const logMin = Math.log10(20);
      const logMax = Math.log10(maxGraphFreq);
      const x = padding + ((logFreq - logMin) / (logMax - logMin)) * graphWidth;

      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillText(label, x, height - padding + 20);
    }

    // 0dB reference line
    const centerY = padding + (maxDb - 0) * (graphHeight / dbRange);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.stroke();

    // Draw frequency response curve
    ctx.strokeStyle = '#4dd0e1';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const logMin = Math.log10(20);
    const logMax = Math.log10(maxGraphFreq);

    for (let i = 0; i < frequencyResponse.length; i++) {
      const logFreq = logMin + (i / (frequencyResponse.length - 1)) * (logMax - logMin);
      const magnitude = Math.max(minDb, Math.min(maxDb, frequencyResponse[i]));

      const x = padding + ((logFreq - logMin) / (logMax - logMin)) * graphWidth;
      const y = padding + (maxDb - magnitude) * (graphHeight / dbRange);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#ccc';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Frequency (Hz)', width / 2, height - 5);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Magnitude (dB)', 0, 0);
    ctx.restore();
  }, [profile, audioEngine]);

  return (
    <div className="frequency-visualization">
      <canvas
        ref={canvasRef}
        className="visualization-canvas"
      />
    </div>
  );
}
