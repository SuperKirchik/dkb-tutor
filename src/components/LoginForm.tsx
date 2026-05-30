"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (!response.ok) {
      setMessage("Не удалось войти. Проверь базу данных, email и пароль.");
      setIsSubmitting(false);
      return;
    }

    const data = (await response.json()) as {
      token: string;
      user: { role: "ADMIN" | "STUDENT" };
    };

    localStorage.setItem("tutor-platform-token", data.token);
    router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <p className="eyebrow">Авторизация</p>
      <h1>Вход в аккаунт</h1>
      <label>
        Email
        <input autoComplete="username" name="email" required type="email" />
      </label>
      <label>
        Пароль
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      <a className="muted-link" href="#">
        Восстановить пароль
      </a>
      <button className="button primary" disabled={isSubmitting} type="submit">
        Войти
      </button>
      {message ? <p className="status overdue">{message}</p> : null}
    </form>
  );
}
