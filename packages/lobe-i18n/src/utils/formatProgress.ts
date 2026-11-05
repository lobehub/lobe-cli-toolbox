export const formatTokens = (tokens: number) => `${tokens.toLocaleString('en-US')} tokens`;

/** e.g. `2/5 chunks · ~12,000 tokens` */
export const progressDetail = (step: number, maxStep: number, needToken?: number) =>
  [`${step}/${maxStep} chunks`, needToken ? `~${formatTokens(needToken)}` : '']
    .filter(Boolean)
    .join(' · ');
