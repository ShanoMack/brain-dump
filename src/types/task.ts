
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  tagId: string | null;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
