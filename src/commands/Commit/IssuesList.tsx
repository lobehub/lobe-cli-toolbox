import { MultiSelect, Spinner, TextInput } from '@inkjs/ui';
import { Text } from 'ink';
import { debounce } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { View } from '../../components/index';
import getIssuesList from '../../utils/getIssuesList';
import getRepo from '../../utils/getRepo';

interface IssuesListProps {
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const IssuesList: React.FC<IssuesListProps> = ({ onChange, onSubmit }) => {
  const [isGithubReop, setIsGithubRepo] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string>('');
  const [list, setList] = useState<any>();
  const [items, setItems] = useState<any[]>([]);
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

  const handleKeywors = (v: string) => {
    setKeywords(v.replace(/ /g, ''));
  };

  if (isGithubReop) {
    if (!items)
      return (
        <>
          <View>
            <TextInput
              placeholder="Input linked <issues>, or press [Enter] to skip..."
              onChange={onChange}
              onSubmit={onSubmit}
            />
          </View>
          <View>
            <Spinner label=" Loading issues..." />
          </View>
        </>
      );
    return (
      <>
        <View>
          <TextInput
            placeholder={
              items?.length > 0
                ? 'Input to keywords to filter issues, press [Enter] to confirm or skip...'
                : 'No issues found, press [Enter] to skip...'
            }
            onChange={debounce(handleKeywors, 100)}
          />
        </View>
        <View>
          <Text color="gray">Use [Space] to multi-select:</Text>
          <MultiSelect
            options={items}
            onChange={(v) => onChange(v.join(','))}
            onSubmit={onSubmit}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <View>
        <Text color="blue">❯ </Text>
        <TextInput
          placeholder="Input linked <issues>, or press [Enter] to skip..."
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </View>
    </>
  );
};

export default React.memo(IssuesList);
