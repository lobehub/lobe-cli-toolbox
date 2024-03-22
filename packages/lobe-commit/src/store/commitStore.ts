import { kebabCase } from 'lodash-es';
import { createWithEqualityFn } from 'zustand/traditional';

import { type IssuesType, commitMessageToObj, commotObjToMessage } from '@/utils/genCommitMessage';
import getIssuesList from '@/utils/getIssuesList';
import getRepo from '@/utils/getRepo';

export type Step = 'type' | 'scope' | 'subject' | 'issues' | 'issuesType' | 'ai' | 'commit';

export interface CommitStore {
  body: string;
  emoji: string;
  fetchIssuesList: () => void;
  isGithubRepo: boolean;
  issueList: any[];
  issues: string;
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
  step: Step;
  subject: string;
  type: string;
}
export const useCommitStore = createWithEqualityFn<CommitStore>((set, get) => ({
  body: '',
  emoji: '',
  fetchIssuesList: async () => {
    const data = await getRepo();
    if (data) {
      set({ isGithubRepo: true, issuesLoading: true });
      const issuesData = await getIssuesList();
      const issueList = issuesData?.filter((item: any) => item.state === 'open') || [];
      if (issueList?.length > 0) {
        set({ issueList, issuesLoading: false });
      } else {
        set({ isGithubRepo: false, issuesLoading: false });
      }
    }
  },
  isGithubRepo: false,
  issueList: [],
  issues: '',
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
  step: 'type',
  subject: '',
  type: '',
}));
