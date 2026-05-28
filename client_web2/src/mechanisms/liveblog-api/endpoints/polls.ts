import { api } from '../client';
import type { EveList, Poll, PollBody } from '../types';

export function createPoll(blogId: string, pollBody: PollBody): Promise<Poll> {
  return api.post<Poll>('/polls', {
    blog: blogId,
    poll_body: pollBody,
  });
}

export function getPoll(pollId: string): Promise<Poll> {
  return api.get<Poll>(`/polls/${pollId}`);
}

export function updatePoll(poll: Poll, pollBody: PollBody): Promise<Poll> {
  if (!poll._etag) {
    throw new Error('Poll etag required for update');
  }
  return api.patch<Poll>(
    `/polls/${poll._id}`,
    {
      blog: poll.blog,
      poll_body: pollBody,
    },
    { etag: poll._etag },
  );
}

export async function savePollForPost(
  blogId: string,
  pollBody: PollBody,
  existingPollId?: string,
): Promise<Poll> {
  if (existingPollId) {
    const existing = await getPoll(existingPollId);
    const mergedBody: PollBody = {
      ...pollBody,
      answers: existing.poll_body.answers.map((answer, index) => ({
        option: pollBody.answers[index]?.option ?? answer.option,
        votes: answer.votes,
      })),
    };
    return updatePoll(existing, mergedBody);
  }
  return createPoll(blogId, pollBody);
}

export function listBlogPolls(blogId: string): Promise<EveList<Poll>> {
  return api.get<EveList<Poll>>('/polls', {
    where: JSON.stringify({ blog: blogId }),
    max_results: 50,
  });
}
