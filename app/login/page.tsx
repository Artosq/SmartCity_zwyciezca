"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { name },
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col justify-center gap-6 px-5 py-8">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← Wróć na stronę główną
      </Link>

      <h1 className="text-2xl font-bold text-brand-dark">Zaloguj się</h1>
      <p className="text-slate-600">
        Bez hasła. Podaj imię i e-mail — wyślemy Ci link do logowania.
      </p>

      {status === "sent" ? (
        <div className="rounded-2xl border border-brand/30 bg-green-50 p-5 text-green-800">
          <p className="font-semibold">Sprawdź swoją skrzynkę ✉️</p>
          <p className="text-sm">
            Wysłaliśmy link logowania na <strong>{email}</strong>. Kliknij go, aby
            wejść do aplikacji.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-medium text-slate-700">Imię</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
              placeholder="np. Anna"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium text-slate-700">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
              placeholder="anna@example.com"
            />
          </label>

          {status === "error" && (
            <p className="text-sm text-red-600">Błąd: {errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-2xl bg-brand px-5 py-4 text-lg font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {status === "sending" ? "Wysyłanie…" : "Wyślij link logowania"}
          </button>
        </form>
      )}
    </main>
  );
}
