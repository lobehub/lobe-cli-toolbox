import { MultiSelect, Spinner, TextInput } from '@inkjs/ui';
import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';
import getIssuesList from '../../utils/getIssuesList';
import getRepo from '../../utils/getRepo.js';

interface IssuesListProps {
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const IssuesList: React.FC<IssuesListProps> = ({ onChange, onSubmit }) => {
  const [isGithubReop, setIsGithubRepo] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string>('');
  const [list, setList] = useState<any>();
  const [items, setItems] = useState();
  useEffect(() => {
    getRepo().then((data) => {
      if (data) {
        setIsGithubRepo(true);
        getIssuesList().then((data) => {
          setList(data?.filter((item: any) => item.state === 'open'));
        });
      }
    });
  }, []);
  useEffect(() => {
    if (!list) return;
    let newItems = list;
    if (keywords)
      newItems = newItems.filter(
        (item: any) =>
          item.title.toLowerCase().includes(keywords) || String(item.number).includes(keywords),
      );
    newItems = newItems.map((item: any) => ({
      label: (
        <Text>
          {` `}
          <Text backgroundColor="#222" color="#fff">{` #${item.number} `}</Text>
          {` ${item.title}`}
        </Text>
      ),
      value: item.number,
    }));
    setItems(newItems);
  }, [list, keywords]);

  if (isGithubReop) {
    if (!items)
      return (
        <>
          <Spinner label=" Loading issues..." />
          <TextInput
            placeholder="Input linked <issues>..."
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </>
      );
    return (
      <>
        <MultiSelect options={items} onChange={(v) => onChange(v.join(','))} onSubmit={onSubmit} />
        <TextInput
          placeholder={
            items?.length > 0 ? 'Fliter issues...' : 'No issues found, press enter to skip...'
          }
          onChange={(v) => setKeywords(v.replace(/ /g, ''))}
        />
      </>
    );
  }

  return (
    <>
      <Box>
        <Text color="blue">❯ </Text>
        <TextInput placeholder="Input linked <issues>..." onChange={onChange} onSubmit={onSubmit} />
      </Box>
    </>
  );
};

export default React.memo(IssuesList);
