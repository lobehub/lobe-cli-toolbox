import { getErrorMessage } from './errors';

export const formatTokens = (tokens: number) => `${tokens.toLocaleString('en-US')} tokens`;

/** e.g. `2/5 chunks · ~12,000 tokens` */
export const progressDetail = (step: number, maxStep: number, needToken?: number) =>
  [`${step}/${maxStep} chunks`, needToken ? `~${formatTokens(needToken)}` : '']
    .filter(Boolean)
    .join(' · ');

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** Task status for a translation result, e.g. `warning` with `2 keys skipped, rerun to retry`. */
export const summarizeOutcome = ({
  errors,
  failedKeys,
  tokenUsage,
}: {
  errors: unknown[];
  failedKeys: string[];
  tokenUsage: number;
}): { detail: string; status: 'done' | 'error' | 'warning' } => {
  const tokens = formatTokens(tokenUsage);
  if (errors.length > 0)
    return {
      detail: `${plural(errors.length, 'chunk')} failed: ${getErrorMessage(errors[0])} · ${tokens}`,
      status: 'error',
    };
  if (failedKeys.length > 0)
    return {
      detail: `${plural(failedKeys.length, 'key')} skipped, rerun to retry · ${tokens}`,
      status: 'warning',
    };
  return { detail: tokens, status: 'done' };
};
