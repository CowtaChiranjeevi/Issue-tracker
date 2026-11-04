export type Role = 'ROLE_ADMIN' | 'ROLE_MEMBER' | 'ROLE_VIEWER';

export type IssueStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse extends User {
  token: string;
  tokenType: string;
}

export interface Project {
  id: number;
  name: string;
  key: string;
  description: string;
  ownerId: number;
  ownerName: string;
  createdAt: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: number;
  projectKey: string;
  assigneeId?: number;
  assigneeName?: string;
  reporterId: number;
  reporterName: string;
  version: number;
  createdAt: string;
  updatedAt?: string;
}