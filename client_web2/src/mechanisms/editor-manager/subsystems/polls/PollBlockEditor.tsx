import { useEffect, useState } from 'react';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import type { PollBody } from '@/mechanisms/liveblog-api';
import { buildPollActiveUntil, parsePollDuration } from './pollCalculations';

export interface PollBlockEditorProps {
  pollBody: PollBody | null;
  onChange(pollBody: PollBody | null): void;
}

const emptyAnswers = () => [
  { option: '', votes: 0 },
  { option: '', votes: 0 },
];

function defaultPollDraft(): PollBody {
  return {
    question: '',
    answers: emptyAnswers(),
    active_until: '',
  };
}

export function PollBlockEditor({ pollBody, onChange }: PollBlockEditorProps) {
  const draft = pollBody ?? defaultPollDraft();
  const question = draft.question ?? '';
  const answers = draft.answers?.length ? draft.answers : emptyAnswers();
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (pollBody?.active_until) {
      const parsed = parsePollDuration(pollBody.active_until);
      setDays(parsed.days);
      setHours(parsed.hours);
      setMinutes(parsed.minutes);
    } else {
      setDays(0);
      setHours(0);
      setMinutes(0);
    }
  }, [pollBody?.active_until]);

  const emitDraft = (
    nextQuestion: string,
    nextAnswers: typeof answers,
    d: number,
    h: number,
    m: number,
  ) => {
    const hasDuration = d > 0 || h > 0 || m > 0;
    onChange({
      question: nextQuestion,
      answers: nextAnswers.map((a) => ({ option: a.option, votes: a.votes ?? 0 })),
      active_until: hasDuration ? buildPollActiveUntil(d, h, m) : '',
    });
  };

  const updateQuestion = (value: string) => {
    emitDraft(value, answers, days, hours, minutes);
  };

  const updateAnswer = (index: number, value: string) => {
    const next = answers.map((a, i) => (i === index ? { ...a, option: value } : a));
    emitDraft(question, next, days, hours, minutes);
  };

  const addAnswer = () => {
    const next = [...answers, { option: '', votes: 0 }];
    emitDraft(question, next, days, hours, minutes);
  };

  const removeAnswer = (index: number) => {
    if (answers.length <= 2) return;
    const next = answers.filter((_, i) => i !== index);
    emitDraft(question, next, days, hours, minutes);
  };

  return (
    <div className="m-poll-editor">
      <LbFormField label="Vraag" htmlFor="poll-question">
        <input
          id="poll-question"
          className="m-editor-composer__input w-full"
          value={question}
          onChange={(e) => updateQuestion(e.target.value)}
          placeholder="Poll-vraag"
        />
      </LbFormField>

      <fieldset className="mt-3 space-y-2">
        <legend className="text-sm font-medium text-mar-muted">Antwoorde</legend>
        {answers.map((answer, index) => (
          <div key={index} className="flex gap-2">
            <input
              className="m-editor-composer__input flex-1"
              value={answer.option}
              onChange={(e) => updateAnswer(index, e.target.value)}
              placeholder={`Antwoord ${index + 1}`}
            />
            {answers.length > 2 && (
              <LbButton type="button" variant="ghost" onClick={() => removeAnswer(index)}>
                ×
              </LbButton>
            )}
          </div>
        ))}
        <LbButton type="button" variant="secondary" onClick={addAnswer}>
          + Antwoord
        </LbButton>
      </fieldset>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <LbFormField label="Dae" htmlFor="poll-days">
          <input
            id="poll-days"
            type="number"
            min={0}
            className="m-editor-composer__input w-full"
            value={days}
            onChange={(e) => {
              const d = Number(e.target.value);
              setDays(d);
              emitDraft(question, answers, d, hours, minutes);
            }}
          />
        </LbFormField>
        <LbFormField label="Ure" htmlFor="poll-hours">
          <input
            id="poll-hours"
            type="number"
            min={0}
            className="m-editor-composer__input w-full"
            value={hours}
            onChange={(e) => {
              const h = Number(e.target.value);
              setHours(h);
              emitDraft(question, answers, days, h, minutes);
            }}
          />
        </LbFormField>
        <LbFormField label="Minute" htmlFor="poll-minutes">
          <input
            id="poll-minutes"
            type="number"
            min={0}
            className="m-editor-composer__input w-full"
            value={minutes}
            onChange={(e) => {
              const m = Number(e.target.value);
              setMinutes(m);
              emitDraft(question, answers, days, hours, m);
            }}
          />
        </LbFormField>
      </div>
    </div>
  );
}
