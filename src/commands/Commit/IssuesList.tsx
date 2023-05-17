import { MultiSelect, TextInput } from '@inkjs/ui';
import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';
import getIssuesList from '../../utils/getIssuesList';

interface IssuesListProps {
  onChange: (value: string) => void;
  onSubmit: () => void;
}
const IssuesList: React.FC<IssuesListProps> = ({ onChange, onSubmit }) => {
  const [items, setItems] = useState();
  useEffect(() => {
    getIssuesList().then((data) => {
      const newItems = data
        ?.filter((item: any) => item.state === 'open')
        ?.map((item: any) => ({
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
    });
  }, []);

  if (items)
    return (
      <MultiSelect options={items} onChange={(v) => onChange(v.join(','))} onSubmit={onSubmit} />
    );
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
