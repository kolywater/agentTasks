export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: boolean;
  dueDate: string | null;
  recurDays: number | null;
  recurSource: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface TasksData {
  tasks: Task[];
}
