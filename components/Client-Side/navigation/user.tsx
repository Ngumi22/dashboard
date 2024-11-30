import Link from "next/link";

export default function User() {
  return (
    <Link
      href="/account"
      className="grid grid-flow-col content-center place-content-start gap-2 m-auto py-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-user my-auto">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <p className="text-sm">Register</p>
    </Link>
  );
}
