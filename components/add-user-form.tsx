// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function AddUserForm() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("user");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const res = await fetch("/api/users", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ username, email, password, role }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       router.push("/dashboard");
//     } else {
//       setError(data.message);
//     }
//   };

//   return (
//     <div>
//       <h1>Add User</h1>
//       {error && <p className="text-red-500">{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <Label htmlFor="username">Username</Label>
//           <Input
//             id="username"
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <Label htmlFor="email">Email</Label>
//           <Input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <Label htmlFor="password">Password</Label>
//           <Input
//             id="password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <Label htmlFor="role">Role</Label>
//           <select
//             id="role"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             required>
//             <option value="user">User</option>
//             <option value="admin">Admin</option>
//           </select>
//         </div>
//         <Button type="submit">Create User</Button>
//       </form>
//     </div>
//   );
// }
