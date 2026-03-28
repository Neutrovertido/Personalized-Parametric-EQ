/**
 * Download Exporter Service
 * Exports EQ settings to specified text format
 */

import type { EQProfile } from './filterMath';

export function exportEQToText(profile: EQProfile): string {
  const lines: string[] = [];
  
  // Preamp line
  lines.push(`Preamp: ${profile.preamp.toFixed(1)} dB`);
  
  // Filter lines
  for (let i = 0; i < profile.bands.length; i++) {
    const band = profile.bands[i];
    const filterNum = i + 1;
    const status = band.enabled ? 'ON' : 'OFF';
    const fcHz = band.fcHz;
    const gain = band.gainDb.toFixed(1);
    const q = band.q.toFixed(2);
    const filterType = band.filterType;
    
    lines.push(`Filter ${filterNum}: ${status} ${filterType} Fc ${fcHz} Hz Gain ${gain} dB Q ${q}`);
  }
  
  return lines.join('\n');
}

export function downloadEQSettings(profile: EQProfile, filename: string = 'eqsettings.txt'): void {
  const content = exportEQToText(profile);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import EQ settings from text format
 * This is a basic parser for the format we export
 */
export function parseEQFromText(content: string): EQProfile | null {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 11) {
    console.error('Invalid format: not enough lines');
    return null;
  }
  
  const profile: EQProfile = {
    preamp: 0,
    bands: [],
  };
  
  // Parse preamp
  const preampMatch = lines[0].match(/Preamp:\s*([-\d.]+)\s*dB/);
  if (preampMatch) {
    profile.preamp = parseFloat(preampMatch[1]);
  }
  
  // Parse filters
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const filterMatch = line.match(
      /Filter\s+\d+:\s+(ON|OFF)\s+(PK|LSC|HSC)\s+Fc\s+([\d.]+)\s+Hz\s+Gain\s+([-\d.]+)\s+dB\s+Q\s+([\d.]+)/
    );
    
    if (filterMatch) {
      const [, status, filterType, fcHz, gain, q] = filterMatch;
      profile.bands.push({
        enabled: status === 'ON',
        fcHz: parseFloat(fcHz),
        gainDb: parseFloat(gain),
        q: parseFloat(q),
        filterType: filterType as 'PK' | 'LSC' | 'HSC',
      });
    }
  }
  
  return profile.bands.length === 10 ? profile : null;
}
