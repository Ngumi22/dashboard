export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  roles: Role[];
  is_verified: boolean;
  is_blocked: boolean;
}

export interface Role {
  role_id: number;
  role_name: string;
}
