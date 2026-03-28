import { useState } from 'react';
import { QUIZ_QUESTIONS } from '../services/quizDefinition';
import { getAudioEngine } from '../services/audioEngine';
import QuizQuestion from './QuizQuestion';
import './QuizFlow.css';

interface QuizFlowProps {
  currentQuestion: number;
  onAnswer: (answerIndex: number) => void;
  totalQuestions: number;
}

export default function QuizFlow({
  currentQuestion,
  onAnswer,
  totalQuestions,
}: QuizFlowProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const audioEngine = getAudioEngine();
  const question = QUIZ_QUESTIONS[currentQuestion];

  const handleSelectVariation = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    // Apply the variation to audio
    const profile = question.variations[answerIndex].eqProfile;
    audioEngine.updateProfile(profile);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="quiz-flow">
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
          <p className="progress-text">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>

        <QuizQuestion
          question={question}
          selectedAnswer={selectedAnswer}
          onSelectVariation={handleSelectVariation}
        />

        <div className="quiz-actions">
          <button
            className="next-button"
            onClick={handleNext}
            disabled={selectedAnswer === null}
          >
            {currentQuestion === totalQuestions - 1 ? 'Complete Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
