import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="brand" href="/">
          Кабинет репетитора
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
