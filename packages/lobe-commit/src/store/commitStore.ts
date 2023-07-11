import { kebabCase } from 'lodash-es';
import { create } from 'zustand';

import genCommitMessage from '@/utils/genCommitMessage';
import getIssuesList from '@/utils/getIssuesList';
import getRepo from '@/utils/getRepo';

export type Step = 'feat' | 'scope' | 'subject' | 'issues' | 'ai' | 'commit' | 'done';
export interface CommitStore {
  emoji: string;
  fetchIssuesList: () => void;
  isGithubRepo: boolean;
  issueList: any[];
  issues: string;
  issuesLoading: boolean;
  message: string;
  refreshMessage: () => void;
  scope: string;
  setEmoji: (emoji: string) => void;
  setIssues: (issues: string) => void;
  setMessage: (message: string) => void;
  setScope: (scope: string) => void;
  setStep: (step: Step) => void;
  setSubject: (subject: string) => void;
  setType: (type: string) => void;
  step: Step;
  subject: string;
  type: string;
}
export const useCommitStore = create<CommitStore>((set, get) => ({
  emoji: '',
  fetchIssuesList: async () => {
    const data = await getRepo();
    if (data) {
      set({ isGithubRepo: true, issuesLoading: true });
      const issuesData = await getIssuesList();
      const issueList = issuesData?.filter((item: any) => item.state === 'open');
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
  message: '',
  refreshMessage: () => {
    const { issues, scope, subject, type, emoji } = get();
    const message = genCommitMessage({ emoji, issues, scope, subject, type });
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
  setMessage: (message) => {
    set({ message });
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
  step: 'feat',
  subject: '',
  type: '',
}));
