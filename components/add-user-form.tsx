// "use client";

// import Link from "next/link";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { signUpSchema } from "@/lib/utils";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";

// export default function SignUpForm(formData: FormData) {
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting, isValid },
//   } = useForm({
//     resolver: zodResolver(signUpSchema),
//   });

//   const first_name = formData.get("first_name");
//   const last_name = formData.get("last_name");
//   const email = formData.get("email");
//   const role = formData.get("role");
//   const password = formData.get("password");
//   const password2 = formData.get("password2");

//   function onSubmit(formData: FormData) {
//     console.log(formData);
//   }
//   return (
//     <form action={onSubmit}>
//       <Card className="mx-auto max-w-sm">
//         <CardHeader>
//           <CardTitle className="text-xl">Sign Up</CardTitle>
//           <CardDescription>
//             Enter your information to create an account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="first_name">First name</Label>
//                 <Input id="first_name" placeholder="Max" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="last_name">Last name</Label>
//                 <Input id="last_name" placeholder="Robinson" required />
//               </div>
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="m@example.com"
//                 required
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="last_name">Role</Label>
//               <Input id="user" placeholder="User" required />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="password">Password</Label>
//               <Input id="password" type="password" />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="password2">Confirm Password</Label>
//               <Input id="password2" type="password" />
//             </div>
//             <Button type="submit" className="w-full">
//               Create an account
//             </Button>
//             <Button variant="outline" className="w-full">
//               Sign up with GitHub
//             </Button>
//           </div>
//           <div className="mt-4 text-center text-sm">
//             Already have an account?{" "}
//             <Link href="#" className="underline">
//               Sign in
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </form>
//   );
// }
