export type Roles = "super-admin" | "admin" | "manager" | "user";

// Users Table
export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email: string;
  password_hash: string;
  image?: Buffer; // MEDIUMBLOB in MySQL
  is_verified: boolean;
  password_last_changed?: Date;
  password_expiration_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// Roles Table
export interface Role {
  id: number;
  role_name: string;
  created_at: Date;
  updated_at: Date;
}

// User Roles Table
export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
}

// Entities Table
export interface Entity {
  id: number;
  entity_name: string;
  created_at: Date;
  updated_at: Date;
}

// Actions Table
export interface Action {
  id: number;
  action_name: string;
  created_at: Date;
  updated_at: Date;
}

// Permissions Table
export interface Permission {
  id: number;
  role_id: number;
  entity_id: number;
  action_id: number;
  hasPermission: boolean;
}

// Sessions Table
export interface Session {
  session_id: number;
  user_id: number;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  is_valid: boolean;
  created_at: Date;
  expires_at: Date;
}

// Notifications Table
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  type: "info" | "warning" | "error" | "success";
  is_read: boolean;
  created_at: Date;
}

// Action Logs Table
export interface ActionLog {
  log_id: number;
  user_id: number;
  action_id: number;
  entity_id: number;
  target_id: number;
  timestamp: Date;
}

export interface RoleEntity {
  id: string;
  name: string;
  description?: string;
}

export interface PermissionFormProps {
  permission?: Permission; // Optional for edit mode
  roles: RoleEntity[];
  users: User[];
  entities: Entity[];
  actions: Action[];
  onSubmit: (permission: Omit<Permission, "id">) => void;
}
