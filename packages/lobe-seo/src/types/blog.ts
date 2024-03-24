export interface PostSEO {
  description: string;
  tags: string[];
  title: string;
}

export type BlogPost = PostSEO & {
  [groupKey: string]: PostSEO;
};
