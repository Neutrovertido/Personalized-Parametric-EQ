import React from 'react';
import type { QuizQuestion as QuizQuestionType } from '../services/quizDefinition';
import { getAudioEngine } from '../services/audioEngine';
import './QuizQuestion.css';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: number | null;
  onSelectVariation: (index: number) => void;
}

export default function QuizQuestion({
  question,
  selectedAnswer,
  onSelectVariation,
}: QuizQuestionProps) {
  const audioEngine = getAudioEngine();
  const [playingVariation, setPlayingVariation] = React.useState<number | null>(null);

  const handlePlayVariation = (index: number) => {
    // For now, update the EQ and play
    const profile = question.variations[index].eqProfile;
    audioEngine.updateProfile(profile);
    audioEngine.resumeAudioContext();
    audioEngine.play();
    setPlayingVariation(index);
  };

  const handleStopVariation = () => {
    audioEngine.stop();
    setPlayingVariation(null);
  };

  const handleSelectVariation = (index: number) => {
    handlePlayVariation(index);
    onSelectVariation(index);
  };

  return (
    <div className="quiz-question">
      <div className="question-content">
        <h2 className="question-title">{question.title}</h2>
        <p className="question-description">{question.description}</p>
      </div>

      <div className="variations-grid">
        {question.variations.map((variation, index) => (
          <div
            key={index}
            className={`variation-card ${
              selectedAnswer === index ? 'selected' : ''
            } ${playingVariation === index ? 'playing' : ''}`}
            onClick={() => handleSelectVariation(index)}
          >
            <div className="variation-label">{variation.label}</div>
            <div className="variation-controls">
              {playingVariation === index ? (
                <button
                  className="play-button playing"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStopVariation();
                  }}
                >
                  ⏸️ Stop
                </button>
              ) : (
                <button
                  className="play-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVariation(index);
                  }}
                >
                  ▶️ Play
                </button>
              )}
            </div>
            {selectedAnswer === index && (
              <div className="selected-indicator">✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      <div className="quiz-instructions">
        <p>Click a variation to hear it, then select your favorite</p>
      </div>
    </div>
  );
}
