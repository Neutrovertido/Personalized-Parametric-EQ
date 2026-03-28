/**
 * Audio Engine Service
 * Web Audio API wrapper for parametric EQ processing
 */

import { DEFAULT_EQ_PROFILE } from './filterMath';
import type { BandSettings, EQProfile } from './filterMath';

export class AudioEngine {
  private audioContext: AudioContext;
  private biquadFilters: BiquadFilterNode[] = [];
  private preampGain: GainNode;
  private masterGain: GainNode;
  private audioSource: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private currentProfile: EQProfile = structuredClone(DEFAULT_EQ_PROFILE);
  private isPlaying = false;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create preamp gain node
    this.preampGain = this.audioContext.createGain();
    this.preampGain.gain.value = 1; // Start at 0dB
    
    // Create 10 biquad filters
    for (let i = 0; i < 10; i++) {
      const filter = this.audioContext.createBiquadFilter();
      this.biquadFilters.push(filter);
    }
    
    // Create master gain node
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.8; // Prevent clipping
    
    // Wire: preamp -> filters -> master -> destination
    this.preampGain.connect(this.biquadFilters[0]);
    for (let i = 0; i < this.biquadFilters.length - 1; i++) {
      this.biquadFilters[i].connect(this.biquadFilters[i + 1]);
    }
    this.biquadFilters[this.biquadFilters.length - 1].connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
  }

  /**
   * Load audio from ArrayBuffer (decoded audio)
   */
  async loadAudio(arrayBuffer: ArrayBuffer): Promise<void> {
    try {
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Failed to decode audio:', error);
      throw error;
    }
  }

  /**
   * Load audio from a File object
   */
  async loadAudioFromFile(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    await this.loadAudio(arrayBuffer);
  }

  /**
   * Play the loaded audio (loops by default)
   */
  play(): void {
    if (!this.audioBuffer) return;
    
    // Stop any existing source
    this.stop();
    
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = this.audioBuffer;
    this.audioSource.loop = true;
    this.audioSource.connect(this.preampGain);
    this.audioSource.start();
    this.isPlaying = true;
  }

  /**
   * Stop audio playback
   */
  stop(): void {
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource.disconnect();
      this.audioSource = null;
    }
    this.isPlaying = false;
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Update the EQ profile and apply to filters
   */
  updateProfile(profile: EQProfile): void {
    this.currentProfile = structuredClone(profile);
    this.applyProfile();
  }

  /**
   * Apply current profile to all biquad filters
   */
  private applyProfile(): void {
    // Update preamp
    this.preampGain.gain.value = Math.pow(10, this.currentProfile.preamp / 20);
    
    // Update each band
    for (let i = 0; i < this.currentProfile.bands.length; i++) {
      const band = this.currentProfile.bands[i];
      const filter = this.biquadFilters[i];
      
      if (!band.enabled) {
        filter.gain.value = 0;
        continue;
      }
      
      // Set filter type and frequency
      if (band.filterType === 'PK') {
        filter.type = 'peaking';
      } else if (band.filterType === 'LSC') {
        filter.type = 'lowshelf';
      } else if (band.filterType === 'HSC') {
        filter.type = 'highshelf';
      }
      
      filter.frequency.value = band.fcHz;
      filter.gain.value = band.gainDb;
      filter.Q.value = band.q;
    }
  }

  /**
   * Get current profile
   */
  getProfile(): EQProfile {
    return structuredClone(this.currentProfile);
  }

  /**
   * Update preamp gain
   */
  setPreamp(gainDb: number): void {
    this.currentProfile.preamp = gainDb;
    this.preampGain.gain.value = Math.pow(10, gainDb / 20);
  }

  /**
   * Update a single band
   */
  updateBand(bandIndex: number, settings: BandSettings): void {
    if (bandIndex >= 0 && bandIndex < this.currentProfile.bands.length) {
      this.currentProfile.bands[bandIndex] = { ...settings };
      this.applyProfile();
    }
  }

  /**
   * Get current sample rate
   */
  getSampleRate(): number {
    return this.audioContext.sampleRate;
  }

  /**
   * Resume audio context if suspended
   */
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterGain.gain.value;
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Singleton instance
 */
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
