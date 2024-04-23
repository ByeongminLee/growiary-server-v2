export interface TopicDTO {
  id: number;
  title: string;
  icon: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTopicDTO {
  title: string;
  icon: string;
  content: string;
}

export interface UpdateTopicDTO {
  id: number;
  title?: string;
  icon?: string;
  content?: string;
}
