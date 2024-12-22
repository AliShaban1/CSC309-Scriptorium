export interface User {
    id: string;
    firstName: string;
    profilePicture?: string | undefined;
  }
  

  export interface Template {
    id: string;
    title: string;
    explanation: string;
    code: string;
    author: User;
    tags: Tag[];
    blogPosts: Blog[];
    language: string;
  };
  export interface Comment {
    id: string;
    content: string;
    author: User;
    post: Blog;
    parent?: Comment; 
    Replies: Comment[]; 
    rating: number;
    liked: User[];
    disliked: User[];
    createdAt: Date;
    hidden: boolean;
    reportCount: number;
  }
  export interface Blog {
    id: string;
    title: string;
    description: string;
    tags: Tag[];
    rating: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    comments: Comment[];
    templates: Template[];
    onlike: () => void;
    onDislike: () => void;
    author: User;
  }

  export interface Tag {
    id: number;
    name: string;
  }; 


  export interface BlogCardProps {
    id: string;
    title: string;
    description: string;
    tags: Tag[];
    authorName: string;
    rating: string;
    link: string;
  };
  export interface CodeEditorProps {
    code: string;
    setCode?: (code: string) => void;
    language: string;
    readOnly?: boolean;
    height?: string;
    width?: string;
  };

  export interface CardProps {
    title: string;
    description: string;
}

export interface CommentProps {
    id: string;
    authorName: string;
    authorProfilePic: string | undefined;
    content: string;
    rating: number;
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
    replies?: Comment[];
    onReply: (id: string) => void;
    depth: number
};
  

export interface ReplyProps {
    id: string;
    content: string;
    rating: number;
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
    replies?: Comment[];
};

export interface TemplateCardProps {
    id: string;
    title: string;
    explanation: string;
    language: string;
    authorName: string;
    authorProfilePic?: string;
    tags: Tag[];
    link: string;
};