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

  const handleSelectVariation = (index: number) => {
    // Clicking a tile both selects and previews that EQ variation.
    const profile = question.variations[index].eqProfile;
    audioEngine.updateProfile(profile);
    audioEngine.resumeAudioContext();
    audioEngine.play();
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
            }`}
            onClick={() => handleSelectVariation(index)}
          >
            <div className="variation-label">{variation.label}</div>
            {selectedAnswer === index && (
              <div className="selected-indicator">✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      <div className="quiz-instructions">
        <p>Click a variation tile to preview and select it</p>
      </div>
    </div>
  );
}
