import pangu from 'pangu';

export default ({
  type,
  scope,
  subject,
  issues,
}: {
  issues?: string;
  scope?: string;
  subject: string;
  type: string;
}): string => {
  if (!type) return 'waiting for selection...';
  let message = type;
  if (scope) message = `${message}(${scope.toLowerCase()})`;
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
