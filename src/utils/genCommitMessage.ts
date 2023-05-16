import pangu from 'pangu';
export default ({
  type,
  scope,
  subject,
  issues,
}: {
  type: string;
  scope?: string;
  subject: string;
  issues?: string;
}): string => {
  if (!type) return 'waiting for selection...';
  let message = type;
  if (scope) message = `${message}(${scope})`;
  message = `${message}: ${pangu.spacing(subject)}`;
  if (issues) {
    const issuesGroup = issues
      .replace('#', '')
      .replace(/\s+/g, ' ')
      .replace(/[，|.|||/| ]/g, ',')
      .split(',')
      .filter(Boolean)
      .map((i) => '#' + i);
    message = `${message} [${issuesGroup.join(',')}]`;
  }
  return message.replace(/\s+/g, ' ');
};
