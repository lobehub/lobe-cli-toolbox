export interface PostSEO {
  description: string;
  tags: string[];
  title: string;
}

export interface BlogPost {
  seo: PostSEO;
  title: string;
}
