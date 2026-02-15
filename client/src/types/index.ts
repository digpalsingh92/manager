// ─── Enums ───────────────────────────────────
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// ─── User Types ──────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  roles?: string[];
  permissions?: string[];
}

export interface AuthUser extends User {
  roles: string[];
  permissions: string[];
}

// ─── Role & Permission Types ─────────────────
export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  userCount?: number;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

// ─── Project Types ───────────────────────────
export interface ProjectMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: ProjectMember;
  members: { user: ProjectMember }[];
  tasks?: Task[];
  _count?: { tasks: number; members: number };
}

// ─── Task Types ──────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: ProjectMember | null;
  createdBy: { id: string; firstName: string; lastName: string };
  project?: { id: string; name: string };
  comments?: Comment[];
  _count?: { comments: number };
}

// ─── Comment Types ───────────────────────────
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
  user: ProjectMember;
}

// ─── API Response Types ──────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    pagination?: Pagination;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Auth Types ──────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// ─── Form Types ──────────────────────────────
export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId: string;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface CreateCommentPayload {
  content: string;
  taskId: string;
}
