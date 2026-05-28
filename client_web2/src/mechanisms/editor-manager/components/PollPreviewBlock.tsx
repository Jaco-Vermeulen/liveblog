import type { PollBody } from '@/mechanisms/liveblog-api';
import { pollCalculations } from '../subsystems/polls/pollCalculations';

export interface PollPreviewBlockProps {
  pollBody: PollBody;
}

export function PollPreviewBlock({ pollBody }: PollPreviewBlockProps) {
  const computed = pollCalculations(pollBody);

  return (
    <div className="m-editor-preview__poll" role="group" aria-label="Poll-voorskou">
      <p className="m-editor-preview__poll-question">{computed.question}</p>
      <ul className="m-editor-preview__poll-options">
        {computed.answers.map((answer) => (
          <li key={answer.option} className="m-editor-preview__poll-option">
            <div className="m-editor-preview__poll-option-head">
              <span>{answer.option}</span>
              <span className="m-editor-preview__poll-percent">{answer.percentage ?? 0}%</span>
            </div>
            <div className="m-editor-preview__poll-bar" aria-hidden>
              <span
                className="m-editor-preview__poll-bar-fill"
                style={{ width: `${answer.percentage ?? 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {computed.timeLeft ? (
        <p className="m-editor-preview__poll-meta">
          {computed.elapsed ? 'Poll verstryk' : `Nog ${computed.timeLeft}`}
        </p>
      ) : null}
    </div>
  );
}
