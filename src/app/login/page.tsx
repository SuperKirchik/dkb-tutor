import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <BrandLogo href="/" />
        <LoginForm />
      </div>
    </main>
  );
}
