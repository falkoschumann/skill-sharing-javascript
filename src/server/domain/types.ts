export interface Talk {
  title: string;
  presenter: string;
  summary: string;
  comments: Array<Comment>;
}

export interface Comment {
  author: string;
  message: string;
}
