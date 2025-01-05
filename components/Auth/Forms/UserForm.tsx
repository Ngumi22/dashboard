"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/actions/Auth/users/update";
import { createUser } from "@/lib/actions/Auth/users/post";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface User {
  user_id?: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  image: string;
  password_hash: string;
  is_verified: boolean;
  role: "Super-Admin" | "Admin" | "User";
}

interface UserFormProps {
  user?: User;
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<User>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    image: "",
    password_hash: "",
    is_verified: false,
    role: "Super-Admin",
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (
    field: keyof User,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (value: "Super-Admin" | "Admin" | "User") => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user?.user_id) {
        // Update existing user
        await updateUser(user.user_id, formData);
      } else {
        // Create new user
        await createUser(formData);
        alert("User created successfully");
      }
      router.push("/dashboard/users"); // Redirect to user list page
    } catch (error) {
      console.error("Error submitting user data:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={(e) => handleChange("first_name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={(e) => handleChange("phone_number", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={(e) => handleChange("image", e.target.value)}
        />
      </div>
      {!user && (
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password_hash}
            onChange={(e) => handleChange("password_hash", e.target.value)}
            required={!user}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Role</Label>
        <RadioGroup
          onValueChange={handleRoleChange}
          value={user?.role}
          name="role">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Super-Admin" id="Super-Admin" />
            <Label htmlFor="super_admin">Super Admin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Admin" id="Admin" />
            <Label htmlFor="Admin">Admin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="User" id="User" />
            <Label htmlFor="User">User</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_verified"
          checked={formData.is_verified}
          onCheckedChange={(checked) =>
            handleChange("is_verified", checked as boolean)
          }
        />
        <Label htmlFor="is_verified">Is Verified</Label>
      </div>

      <Button type="submit">{user ? "Update User" : "Create User"}</Button>
    </form>
  );
}
