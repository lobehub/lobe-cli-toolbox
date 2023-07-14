import { ProgressBar, Spinner, StatusMessage } from '@inkjs/ui';
import { SplitView, useTheme } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { merge } from 'lodash-es';
import { memo, useEffect, useState } from 'react';

import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';
import { setLocaleFolderObj, setLocaleObj } from '@/utils/setLocaleObj';
import { mergeJSONChunks } from '@/utils/splitJson';
import { translateJSON } from '@/utils/translateJSON';

export type translateJSONProps = ({
  config,
  from,
  json,
  to,
}: {
  config: I18nConfig;
  from: string;
  json: LocaleObj;
  to: string;
}) => Promise<LocaleObj>;
export interface QueryItemProps {
  filename: string;
  from: string;
  isFolder: boolean;
  orignalJSON: LocaleObj;
  splitJSON: LocaleObj[];
  to: string;
}

const QueryItem = memo<{
  config: I18nConfig;
  item: QueryItemProps;
}>(({ item, config }) => {
  const theme = useTheme();
  const [setp, setStep] = useState(0);
  const maxStep = item.splitJSON.length;
  const { filename, from, isFolder, splitJSON, orignalJSON, to } = item;
  const runQueryItem = async () => {
    const translatedSplitJSON: LocaleObj[] = [];
    for (const json of splitJSON) {
      const result = await translateJSON({ config, from, json, to });
      translatedSplitJSON.push(result);
      if (setp < maxStep) setStep(setp + 1);
    }
    const mergeTranslateObj = merge(orignalJSON, mergeJSONChunks(translatedSplitJSON));
    if (isFolder) {
      setLocaleFolderObj(config, to, filename, mergeTranslateObj);
    } else {
      setLocaleObj(config, to, mergeTranslateObj);
    }
  };

  useEffect(() => {
    runQueryItem();
  }, []);

  return (
    <SplitView flexDirection={'column'}>
      <Text backgroundColor={theme.colorBgLayout} color={theme.colorText}>
        {isFolder ? ` 🗂️ ${to}/${filename} ` : ` 📝 ${to}.json `}
      </Text>
      {setp === maxStep ? (
        <StatusMessage variant={'success'}>Success</StatusMessage>
      ) : (
        <Box>
          <Spinner label={`${(setp / maxStep) * 100}%`} />
          <Box marginLeft={1} marginRight={1} width={20}>
            <Text color={theme.colorTextDescription}>
              {`- from `}
              <Text bold color={theme.colorInfo}>
                {from}
              </Text>
              {` to `}
              <Text bold color={theme.colorInfo}>
                {to}
              </Text>
            </Text>
          </Box>
          <ProgressBar value={Math.floor((setp / maxStep) * 100)} />
        </Box>
      )}
    </SplitView>
  );
});

export default QueryItem;
