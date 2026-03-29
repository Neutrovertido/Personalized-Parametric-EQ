import { useEffect, useState } from 'react';
import { getAudioEngine } from '../services/audioEngine';
import './MediaControlBar.css';

interface MediaControlBarProps {
  fileName: string | null;
  canToggleEQ: boolean;
}

export default function MediaControlBar({ fileName, canToggleEQ }: MediaControlBarProps) {
  const audioEngine = getAudioEngine();
  const [isPlaying, setIsPlaying] = useState(audioEngine.getIsPlaying());
  const [hasAudio, setHasAudio] = useState(audioEngine.hasAudioLoaded());
  const [volume, setVolume] = useState(audioEngine.getMasterVolume());
  const [currentTime, setCurrentTime] = useState(audioEngine.getCurrentTime());
  const [duration, setDuration] = useState(audioEngine.getDuration());
  const [eqEnabled, setEqEnabled] = useState(audioEngine.getEQEnabled());

  const formatTime = (seconds: number): string => {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setHasAudio(audioEngine.hasAudioLoaded());
      setCurrentTime(audioEngine.getCurrentTime());
      setDuration(audioEngine.getDuration());
      setEqEnabled(audioEngine.getEQEnabled());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [audioEngine]);

  const togglePlay = async () => {
    if (!hasAudio) {
      return;
    }

    await audioEngine.resumeAudioContext();

    if (audioEngine.getIsPlaying()) {
      audioEngine.pause();
      setIsPlaying(false);
      return;
    }

    audioEngine.play();
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    audioEngine.stop();
    setIsPlaying(false);
  };

  const onVolumeChange = (value: number) => {
    setVolume(value);
    audioEngine.setMasterVolume(value);
  };

  const onSeek = (value: number) => {
    audioEngine.seek(value);
    setCurrentTime(value);
  };

  const onToggleEQ = () => {
    const next = !audioEngine.getEQEnabled();
    audioEngine.setEQEnabled(next);
    setEqEnabled(next);
  };

  return (
    <footer className="media-control-bar" role="contentinfo" aria-label="Media controls">
      <div className="media-track">
        <span className={`status-dot ${isPlaying ? 'playing' : 'idle'}`} />
        <div className="media-track-meta">
          <strong>{fileName ?? 'No audio loaded'}</strong>
          <span>{hasAudio ? (isPlaying ? 'Playing' : 'Ready') : 'Upload audio to enable playback'}</span>
        </div>
      </div>

      <div className="media-progress-group">
        <div className="media-time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          id="global-progress"
          type="range"
          min="0"
          max={Math.max(duration, 0.01)}
          step="0.01"
          value={Math.min(currentTime, Math.max(duration, 0.01))}
          onChange={(event) => onSeek(Number(event.target.value))}
          disabled={!hasAudio || duration <= 0}
        />
      </div>

      <div className="media-transport">
        <button type="button" onClick={togglePlay} disabled={!hasAudio}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button type="button" onClick={stopPlayback} disabled={!hasAudio}>
          ⏹ Stop
        </button>
      </div>

      <div className="media-volume-group">
        {canToggleEQ && (
          <label className={`eq-switch ${!hasAudio ? 'disabled' : ''}`} title="Toggle custom EQ on or off">
            <span className="eq-switch-label">EQ</span>
            <input
              type="checkbox"
              checked={eqEnabled}
              onChange={onToggleEQ}
              disabled={!hasAudio}
              aria-label="Enable custom EQ"
            />
            <span className="eq-switch-track" aria-hidden="true">
              <span className="eq-switch-thumb" />
            </span>
            <span className="eq-switch-state">{eqEnabled ? 'On' : 'Off'}</span>
          </label>
        )}
        <label htmlFor="global-volume">Volume</label>
        <div className="media-volume-row">
          <input
            id="global-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </footer>
  );
}
