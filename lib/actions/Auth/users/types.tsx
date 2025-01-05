// Define the User type
export interface User {
  user_id: number;
  name: string;
  phone_number: string;
  email: string;
  is_verified: boolean;
  role: "Super-Admin" | "Admin" | "User";
  created_at: string; // Or use Date if necessary
  updated_at: string;
  is_blocked?: boolean; // Derived field
  password_hash?: string; // Optional if this data is required
}
