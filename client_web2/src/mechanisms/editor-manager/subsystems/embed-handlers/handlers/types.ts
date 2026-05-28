import type { EmbedMeta } from '../types';

export interface EmbedHandler {
  name: string;
  patterns: RegExp[];
  matches(url: string): boolean;
  embed(url: string, maxWidth?: number): Promise<EmbedMeta>;
}

export function createHandler(
  name: string,
  patterns: RegExp[],
  embed: (url: string, maxWidth?: number) => Promise<EmbedMeta>,
): EmbedHandler {
  return {
    name,
    patterns,
    matches(url: string) {
      return patterns.some((pattern) => pattern.test(url));
    },
    embed,
  };
}
