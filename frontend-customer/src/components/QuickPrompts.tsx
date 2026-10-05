import React from 'react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  'Haircut kal shaam ko',
  'Facial',
  'Tomorrow evening',
  'Rohit ke saath haircut',
  'Check availability',
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="quick-prompts-wrapper" aria-label="Suggested quick requests">
      <div className="quick-prompts-scroll">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="prompt-chip"
            onClick={() => onSelectPrompt(prompt)}
            disabled={disabled}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
