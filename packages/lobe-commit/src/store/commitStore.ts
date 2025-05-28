import { kebabCase } from 'lodash-es';
import { createWithEqualityFn } from 'zustand/traditional';

import { type IssuesType, commitMessageToObj, commotObjToMessage } from '@/utils/genCommitMessage';
import getIssuesList, { type IssuesResult } from '@/utils/getIssuesList';
import getRepo from '@/utils/getRepo';

export type Step = 'type' | 'scope' | 'subject' | 'issues' | 'issuesType' | 'ai' | 'commit';

export interface CommitStore {
  body: string;
  emoji: string;
  fetchIssuesList: () => void;
  isGithubRepo: boolean;
  issueList: any[];
  issues: string;
  issuesError?: string;
  issuesLoading: boolean;
  issuesType: IssuesType;
  message: string;
  refreshMessage: () => void;
  scope: string;
  setEmoji: (emoji: string) => void;
  setIssues: (issues: string) => void;
  setIssuesType: (type: IssuesType) => void;
  setMessage: (message: string) => void;
  setScope: (scope: string) => void;
  setStep: (step: Step) => void;
  setSubject: (subject: string) => void;
  setType: (type: string) => void;
  shouldSkipIssues: boolean;
  step: Step;
  subject: string;
  type: string;
}

const getErrorMessage = (error: IssuesResult['error']): string => {
  switch (error) {
    case 'NO_TOKEN': {
      return 'No GitHub token provided';
    }
    case 'INVALID_TOKEN': {
      return 'Invalid GitHub token';
    }
    case 'PERMISSION_DENIED': {
      return 'Permission denied or private repository';
    }
    case 'TIMEOUT': {
      return 'Request timeout';
    }
    case 'NETWORK_ERROR': {
      return 'Network connection error';
    }
    case 'NO_REPO': {
      return 'Not a GitHub repository';
    }
    default: {
      return 'Unknown error occurred';
    }
  }
};

export const useCommitStore = createWithEqualityFn<CommitStore>((set, get) => ({
  body: '',
  emoji: '',
  fetchIssuesList: async () => {
    const data = await getRepo();
    if (data) {
      set({ isGithubRepo: true, issuesError: undefined, issuesLoading: true });
      const result = await getIssuesList();

      if (result.success && result.data) {
        const issueList = result.data.filter((item: any) => item.state === 'open') || [];
        if (issueList.length > 0) {
          set({ issueList, issuesLoading: false, shouldSkipIssues: false });
        } else {
          // 没有 issues，但不需要跳过步骤，用户可能想手动输入
          set({ isGithubRepo: false, issuesLoading: false, shouldSkipIssues: false });
        }
      } else {
        // 根据错误类型决定是否自动跳过
        const shouldSkip =
          result.error === 'NO_TOKEN' ||
          result.error === 'INVALID_TOKEN' ||
          result.error === 'PERMISSION_DENIED' ||
          result.error === 'TIMEOUT' ||
          result.error === 'NETWORK_ERROR';

        set({
          isGithubRepo: false,
          issuesError: getErrorMessage(result.error),
          issuesLoading: false,
          shouldSkipIssues: shouldSkip,
        });
      }
    } else {
      set({ shouldSkipIssues: false });
    }
  },
  isGithubRepo: false,
  issueList: [],
  issues: '',
  issuesError: undefined,
  issuesLoading: false,
  issuesType: '',
  message: '',
  refreshMessage: () => {
    const { issues, scope, subject, type, emoji, body, issuesType } = get();
    const message = commotObjToMessage({ body, emoji, issues, issuesType, scope, subject, type });
    set({ message });
  },
  scope: '',
  setEmoji: (emoji) => {
    set({ emoji });
    get().refreshMessage();
  },
  setIssues: (issues) => {
    set({ issues });
    get().refreshMessage();
  },
  setIssuesType: (issuesType) => {
    set({ issuesType });
    get().refreshMessage();
  },
  setMessage: (message) => {
    const obj = commitMessageToObj(message);
    set({ ...obj });
    get().refreshMessage();
  },
  setScope: (scope) => {
    set({ scope: kebabCase(scope) });
    get().refreshMessage();
  },
  setStep: (step) => {
    set({ step });
    get().refreshMessage();
  },
  setSubject: (subject) => {
    set({ subject });
    get().refreshMessage();
  },
  setType: (type) => {
    set({ type });
    get().refreshMessage();
  },
  shouldSkipIssues: false,
  step: 'type',
  subject: '',
  type: '',
}));
