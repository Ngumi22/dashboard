import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/components/Auth/login-form"), {
  ssr: false,
});

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <LoginForm />
    </div>
  );
}
