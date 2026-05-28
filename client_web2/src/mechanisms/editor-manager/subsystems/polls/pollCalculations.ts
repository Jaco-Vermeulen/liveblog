import type { PollBody } from '@/mechanisms/liveblog-api';

export function pollCalculations(pollBody: PollBody): PollBody {
  const totalVotes = pollBody.answers.reduce((acc, answer) => acc + answer.votes, 0);
  const activeUntil = new Date(pollBody.active_until);
  const elapsed = activeUntil.getTime() < Date.now();
  const timeLeft = formatTimeLeft(activeUntil);

  let updatedAnswers = pollBody.answers.map((answer) => ({
    ...answer,
    percentage: totalVotes === 0 ? 0 : Math.round((answer.votes / totalVotes) * 100),
  }));

  if (totalVotes > 0) {
    const rawPercentages = pollBody.answers.map((answer) => ({
      ...answer,
      rawPercentage: (answer.votes / totalVotes) * 100,
    }));
    const rounded = rawPercentages.map((answer) => ({
      option: answer.option,
      votes: answer.votes,
      percentage: Math.round(answer.rawPercentage),
      rawPercentage: answer.rawPercentage,
    }));
    const totalPercentage = rounded.reduce((acc, a) => acc + a.percentage, 0);
    const adjustment = 100 - totalPercentage;
    const sorted = [...rounded].sort(
      (a, b) =>
        b.rawPercentage -
        Math.floor(b.rawPercentage) -
        (a.rawPercentage - Math.floor(a.rawPercentage)),
    );
    for (let i = 0; i < Math.abs(adjustment); i++) {
      sorted[i % sorted.length].percentage += Math.sign(adjustment);
    }
    updatedAnswers = sorted
      .map(({ option, votes, percentage }) => ({ option, votes, percentage }))
      .sort((a, b) => b.votes - a.votes);
  }

  return {
    ...pollBody,
    totalVotes,
    answers: updatedAnswers,
    timeLeft,
    elapsed,
  };
}

export function buildPollActiveUntil(days: number, hours: number, minutes: number): string {
  const end = new Date();
  end.setDate(end.getDate() + days);
  end.setHours(end.getHours() + hours);
  end.setMinutes(end.getMinutes() + minutes);
  return end.toISOString();
}

export function parsePollDuration(activeUntil: string): { days: number; hours: number; minutes: number } {
  const diffMs = new Date(activeUntil).getTime() - Date.now();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

function formatTimeLeft(activeUntil: Date): string {
  const diffMs = activeUntil.getTime() - Date.now();
  if (diffMs <= 0) return 'ended';
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `in ${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `in ${hours} hours`;
  const days = Math.floor(hours / 24);
  return `in ${days} days`;
}
