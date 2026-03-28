import React, { useState } from 'react';
import { getAudioEngine } from './services/audioEngine';
import { QUIZ_QUESTIONS, deriveEQFromQuiz } from './services/quizDefinition';
import { DEFAULT_EQ_PROFILE } from './services/filterMath';
import type { EQProfile } from './services/filterMath';
import QuizFlow from './components/QuizFlow';
import EQControlPanel from './components/EQControlPanel';
import MediaControlBar from './components/MediaControlBar';
import defaultAudioSample from './audio/Yoru Lackey.mp3';
import './App.css';

type AppState = 'sample-select' | 'quiz' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('sample-select');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [eqProfile, setEqProfile] = useState<EQProfile>(DEFAULT_EQ_PROFILE);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const audioEngine = getAudioEngine();

  // Handle audio file selection
  const handleAudioSelect = async (file: File | null) => {
    if (file) {
      try {
        await audioEngine.loadAudioFromFile(file);
        setAudioLoaded(true);
        setSelectedFileName(file.name);
        // Auto-start quiz
        handleStartQuiz();
      } catch (error) {
        console.error('Failed to load audio:', error);
        alert('Failed to load audio file. Please try another file.');
      }
    }
  };

  // Handle loading of bundled default sample
  const handleUseDefaultSample = async () => {
    try {
      const response = await fetch(defaultAudioSample);
      if (!response.ok) {
        throw new Error('Unable to fetch default audio sample');
      }

      const arrayBuffer = await response.arrayBuffer();
      await audioEngine.loadAudio(arrayBuffer);
      setAudioLoaded(true);
      setSelectedFileName('Yoru Lackey.mp3 (Default Sample)');
      handleStartQuiz();
    } catch (error) {
      console.error('Failed to load default sample:', error);
      alert('Failed to load the default sample. Please try uploading your own file.');
    }
  };

  // Start quiz
  const handleStartQuiz = () => {
    setAppState('quiz');
    setCurrentQuestion(0);
    setAnswers([]);
    audioEngine.updateProfile(DEFAULT_EQ_PROFILE);
    audioEngine.resumeAudioContext();
  };

  // Answer a quiz question
  const handleAnswerQuestion = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (newAnswers.length === QUIZ_QUESTIONS.length) {
      // Quiz complete - derive EQ
      const derived = deriveEQFromQuiz(newAnswers);
      setEqProfile(derived);
      audioEngine.updateProfile(derived);
      setAppState('results');
    } else {
      setCurrentQuestion(newAnswers.length);
    }
  };

  // Update EQ profile from controls (after quiz)
  const handleEQUpdate = (newProfile: EQProfile) => {
    setEqProfile(newProfile);
    audioEngine.updateProfile(newProfile);
  };

  // Reset everything
  const handleReset = () => {
    audioEngine.stop();
    setAppState('sample-select');
    setCurrentQuestion(0);
    setAnswers([]);
    setEqProfile(DEFAULT_EQ_PROFILE);
    setAudioLoaded(false);
    setSelectedFileName(null);
  };

  return (
    <div className="app">
      {appState === 'sample-select' && (
        <div className="sample-select-screen">
          <div className="container">
            <h1>Parametric EQ Finder</h1>
            <p>Discover your ideal 10-band EQ through an interactive quiz</p>
            <SampleSelector onSelect={handleAudioSelect} onUseDefaultSample={handleUseDefaultSample} />
          </div>
        </div>
      )}

      {appState === 'quiz' && audioLoaded && (
        <QuizFlow
          currentQuestion={currentQuestion}
          onAnswer={handleAnswerQuestion}
          totalQuestions={QUIZ_QUESTIONS.length}
        />
      )}

      {appState === 'results' && (
        <div className="results-screen">
          <div className="container">
            <h2>Your Personalized EQ Profile</h2>
            <EQControlPanel profile={eqProfile} onUpdate={handleEQUpdate} />
            <button className="reset-button" onClick={handleReset}>
              Start Over
            </button>
          </div>
        </div>
      )}

      <MediaControlBar fileName={selectedFileName} />
    </div>
  );
}

interface SampleSelectorProps {
  onSelect: (file: File | null) => void;
  onUseDefaultSample: () => Promise<void>;
}

function SampleSelector({ onSelect, onUseDefaultSample }: SampleSelectorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <div className="sample-selector">
      <div className="button-group">
        <button className="secondary-button" onClick={onUseDefaultSample}>
          🎵 Use Default Sample
        </button>
        <button className="primary-button" onClick={handleUploadClick}>
          📁 Upload Audio File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      <p className="info-text">
        No file on hand? Use the default sample above, or upload MP3/WAV/OGG/FLAC/M4A.
      </p>
    </div>
  );
}

export default App;
