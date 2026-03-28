import React, { useState } from 'react';
import type { EQProfile, BandSettings } from '../services/filterMath';
import { getAudioEngine } from '../services/audioEngine';
import { downloadEQSettings, exportEQToText } from '../services/downloadExporter';
import FrequencyVisualization from './FrequencyVisualization';
import './EQControlPanel.css';

interface EQControlPanelProps {
  profile: EQProfile;
  onUpdate: (profile: EQProfile) => void;
}

export default function EQControlPanel({ profile, onUpdate }: EQControlPanelProps) {
  const audioEngine = getAudioEngine();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.resumeAudioContext();
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    audioEngine.setMasterVolume(volume);
  };

  const handlePreampChange = (newGain: number) => {
    const newProfile = { ...profile, preamp: newGain };
    onUpdate(newProfile);
  };

  const handleBandChange = (bandIndex: number, newSettings: BandSettings) => {
    const newProfile = { ...profile };
    newProfile.bands[bandIndex] = newSettings;
    onUpdate(newProfile);
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    downloadEQSettings(profile, `eq-settings-${timestamp}.txt`);
  };

  return (
    <div className="eq-control-panel">
      <div className="eq-main-content">
        {/* Frequency Response Visualization */}
        <div className="visualization-section">
          <h3>Frequency Response</h3>
          <FrequencyVisualization profile={profile} />
        </div>

        {/* Player Controls */}
        <div className="player-controls">
          <button
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <div className="volume-control">
            <label>Volume:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue={audioEngine.getMasterVolume()}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Preamp Control */}
        <div className="preamp-section">
          <h3>Preamp</h3>
          <div className="preamp-control">
            <input
              type="range"
              min="-12"
              max="12"
              step="0.1"
              value={profile.preamp}
              onChange={(e) => handlePreampChange(parseFloat(e.target.value))}
              className="preamp-slider"
            />
            <div className="preamp-value">{profile.preamp.toFixed(1)} dB</div>
          </div>
        </div>

        {/* 10-Band EQ Controls */}
        <div className="bands-section">
          <h3>10-Band EQ</h3>
          <div className="bands-grid">
            {profile.bands.map((band, index) => (
              <BandControl
                key={index}
                band={band}
                onUpdate={(newBand) => handleBandChange(index, newBand)}
              />
            ))}
          </div>
        </div>

        {/* Settings Display */}
        <div className="settings-display">
          <h3>Current Settings</h3>
          <div className="settings-content">
            <pre>{exportEQToText(profile)}</pre>
          </div>
        </div>

        {/* Download Button */}
        <div className="download-section">
          <button className="download-button" onClick={handleDownload}>
            📥 Download EQ Settings
          </button>
        </div>
      </div>
    </div>
  );
}

interface BandControlProps {
  band: BandSettings;
  onUpdate: (band: BandSettings) => void;
}

function BandControl({ band, onUpdate }: BandControlProps) {
  return (
    <div className="band-control">
      <div className="band-header">
        <label className="band-label">{band.fcHz} Hz</label>
        <input
          type="checkbox"
          checked={band.enabled}
          onChange={(e) =>
            onUpdate({ ...band, enabled: e.target.checked })
          }
          title="Toggle band on/off"
        />
      </div>

      <div className="band-controls">
        {/* Gain Slider */}
        <div className="band-control-row">
          <label>Gain:</label>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.1"
            value={band.gainDb}
            onChange={(e) =>
              onUpdate({ ...band, gainDb: parseFloat(e.target.value) })
            }
            disabled={!band.enabled}
            className="gain-slider"
          />
          <span className="value-display">{band.gainDb.toFixed(1)} dB</span>
        </div>

        {/* Q Factor Slider */}
        <div className="band-control-row">
          <label>Q:</label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={band.q}
            onChange={(e) =>
              onUpdate({ ...band, q: parseFloat(e.target.value) })
            }
            disabled={!band.enabled}
            className="q-slider"
          />
          <span className="value-display">{band.q.toFixed(2)}</span>
        </div>

        {/* Filter Type Selector */}
        <div className="band-control-row">
          <label>Type:</label>
          <select
            value={band.filterType}
            onChange={(e) =>
              onUpdate({
                ...band,
                filterType: e.target.value as 'PK' | 'LSC' | 'HSC',
              })
            }
            disabled={!band.enabled}
            className="filter-type-select"
          >
            <option value="PK">Peak</option>
            <option value="LSC">Low Shelf</option>
            <option value="HSC">High Shelf</option>
          </select>
        </div>
      </div>
    </div>
  );
}
