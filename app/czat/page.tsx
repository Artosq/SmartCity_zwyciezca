import Link from "next/link";

// Placeholder — moduł czatu realizuje Dev 3 (Supabase Realtime).
export default function CzatPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col justify-center gap-4 px-5 py-8 text-center">
      <h1 className="text-2xl font-bold text-brand-dark">Czaty 💬</h1>
      <p className="text-slate-600">Ten moduł jest w budowie.</p>
      <Link href="/" className="text-brand hover:underline">
        ← Wróć na stronę główną
      </Link>
    </main>
  );
}
