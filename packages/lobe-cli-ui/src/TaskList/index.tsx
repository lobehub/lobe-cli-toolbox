import chalk from 'chalk';
import { Box, render, Static, Text } from 'ink';
import { memo, useSyncExternalStore } from 'react';

import { type AlertType, setAlertSink } from '../alert';
import { useTheme } from '../hooks/useTheme';
import ProgressBar from '../ProgressBar';
import Spinner from '../Spinner';
import symbols from '../styles/symbols';
import theme from '../styles/theme';

export type TaskStatus = 'done' | 'error' | 'running' | 'warning';

export interface TaskState {
  /** Dimmed, e.g. a token count. */
  detail?: string;
  id: string;
  /** 0 – 100, shows a progress bar while running. */
  progress?: number;
  status: TaskStatus;
  /** Short colored prefix, e.g. a locale. */
  tag?: string;
  title: string;
}

type Entry =
  | { id: string; kind: 'log'; text: string; type: AlertType }
  | { id: string; kind: 'task'; task: TaskState };

export interface TaskListOptions {
  /** Width of the tag column, so titles line up. */
  tagWidth?: number;
  /** Expected number of tasks, shown as `done/total`. */
  total?: number;
}

export interface TaskList {
  finish: (id: string, status: Exclude<TaskStatus, 'running'>, detail?: string) => void;
  start: (id: string, task: Pick<TaskState, 'tag' | 'title'>) => void;
  /** Resolves once the live view is unmounted and flushed. */
  stop: () => Promise<void>;
  update: (id: string, patch: Pick<TaskState, 'detail' | 'progress'>) => void;
}

interface Snapshot {
  finished: Entry[];
  running: TaskState[];
}

const STATUS = {
  done: { color: theme.colorSuccess, icon: symbols.tick },
  error: { color: theme.colorError, icon: symbols.error },
  warning: { color: theme.colorWarning, icon: symbols.warning },
} as const;

const LOG = {
  error: STATUS.error,
  info: { color: theme.colorInfo, icon: symbols.info },
  success: STATUS.done,
  warn: STATUS.warning,
} as const;

const Tag = memo<{ tag?: string; width?: number }>(({ tag, width }) => {
  const { colorInfo } = useTheme();
  if (!tag) return null;
  return (
    <Box flexShrink={0} marginRight={1} width={width}>
      <Text color={colorInfo}>{tag}</Text>
    </Box>
  );
});

const FinishedLine = memo<{ entry: Entry; tagWidth?: number }>(({ entry, tagWidth }) => {
  if (entry.kind === 'log') {
    const { color, icon } = LOG[entry.type];
    return (
      <Text>
        <Text color={color}>{`${icon} `}</Text>
        {entry.text}
      </Text>
    );
  }
  const { detail, status, tag, title } = entry.task;
  const { color, icon } = STATUS[status as keyof typeof STATUS];
  return (
    <Box>
      <Box flexShrink={0} width={2}>
        <Text color={color}>{icon}</Text>
      </Box>
      <Tag tag={tag} width={tagWidth} />
      <Box flexShrink={1} minWidth={0}>
        <Text wrap="truncate-middle">{title}</Text>
      </Box>
      {detail && (
        <Box flexShrink={0} marginLeft={2}>
          <Text dimColor>{detail}</Text>
        </Box>
      )}
    </Box>
  );
});

const RunningLine = memo<{ tagWidth?: number; task: TaskState }>(({ task, tagWidth }) => (
  <Box>
    <Box flexShrink={0} width={2}>
      <Spinner />
    </Box>
    <Tag tag={task.tag} width={tagWidth} />
    <Box flexShrink={1} minWidth={0}>
      <Text wrap="truncate-middle">{task.title}</Text>
    </Box>
    <Box flexShrink={0} gap={1} marginLeft={2}>
      {task.progress !== undefined && (
        <>
          <ProgressBar value={task.progress} width={20} />
          <Text>{`${Math.round(task.progress)}%`.padStart(4)}</Text>
        </>
      )}
      {task.detail && <Text dimColor>{task.detail}</Text>}
    </Box>
  </Box>
));

const createStore = () => {
  let snapshot: Snapshot = { finished: [], running: [] };
  const listeners = new Set<() => void>();
  return {
    get: () => snapshot,
    set: (next: Snapshot) => {
      snapshot = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

type Store = ReturnType<typeof createStore>;

const TaskListView = memo<{ options: TaskListOptions; store: Store }>(({ options, store }) => {
  const { finished, running } = useSyncExternalStore(store.subscribe, store.get);
  const done = finished.filter((entry) => entry.kind === 'task').length;
  return (
    <>
      <Static items={finished}>
        {(entry) => <FinishedLine entry={entry} key={entry.id} tagWidth={options.tagWidth} />}
      </Static>
      {running.map((task) => (
        <RunningLine key={task.id} tagWidth={options.tagWidth} task={task} />
      ))}
      {options.total !== undefined && running.length > 0 && (
        <Text dimColor>{`  ${done}/${options.total} done`}</Text>
      )}
    </>
  );
});

/** Plain lines for CI logs and pipes, where a live view would only print its last frame. */
const createPlainTaskList = (): TaskList => {
  const tasks = new Map<string, Pick<TaskState, 'tag' | 'title'>>();
  return {
    finish: (id, status, detail) => {
      const task = tasks.get(id);
      if (!task) return;
      const { icon } = STATUS[status];
      const color = { done: chalk.green, error: chalk.red, warning: chalk.yellow }[status];
      const parts = [color(icon), task.tag && chalk.cyan(task.tag), task.title];
      if (detail) parts.push(chalk.gray(detail));
      process.stdout.write(`${parts.filter(Boolean).join(' ')}\n`);
    },
    start: (id, task) => void tasks.set(id, task),
    stop: async () => {},
    update: () => {},
  };
};

/**
 * Live list of running tasks (spinner, progress bar) with finished ones printed above it. While
 * it runs, `alert` messages are shown inside the list instead of tearing the frame.
 */
export const createTaskList = (options: TaskListOptions = {}): TaskList => {
  if (!process.stdout.isTTY || process.env['CI']) return createPlainTaskList();

  const store = createStore();
  const instance = render(<TaskListView options={options} store={store} />);
  let logId = 0;
  let stopped = false;

  const patch = (update: (snapshot: Snapshot) => Snapshot) => store.set(update(store.get()));
  const stopSync = () => {
    if (stopped) return;
    stopped = true;
    setAlertSink(undefined);
    instance.unmount();
  };

  setAlertSink({
    log: (type, text) =>
      patch((s) => ({
        ...s,
        finished: [...s.finished, { id: `log-${logId++}`, kind: 'log', text, type }],
      })),
    stop: stopSync,
  });

  return {
    finish: (id, status, detail) =>
      patch((s) => {
        const task = s.running.find((item) => item.id === id);
        if (!task) return s;
        return {
          finished: [
            ...s.finished,
            { id, kind: 'task', task: { ...task, detail: detail ?? task.detail, status } },
          ],
          running: s.running.filter((item) => item.id !== id),
        };
      }),
    start: (id, task) =>
      patch((s) => ({ ...s, running: [...s.running, { ...task, id, status: 'running' }] })),
    stop: async () => {
      stopSync();
      await instance.waitUntilExit().catch(() => {});
    },
    update: (id, update) =>
      patch((s) => ({
        ...s,
        running: s.running.map((item) => (item.id === id ? { ...item, ...update } : item)),
      })),
  };
};
