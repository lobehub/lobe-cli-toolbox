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
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/[ ./|，]/g, ',')
      .split(',')
      .filter(Boolean)
      .map((index) => '#' + index);
    message = `${message} [${issuesGroup.join(',')}]`;
  }
  return message.replaceAll(/\s+/g, ' ');
};
