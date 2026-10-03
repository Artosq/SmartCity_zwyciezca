import Link from "next/link";

// Placeholder — tablicę ogłoszeń realizuje Dev 3.
export default function OgloszeniaPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col justify-center gap-4 px-5 py-8 text-center">
      <h1 className="text-2xl font-bold text-brand-dark">Ogłoszenia 📌</h1>
      <p className="text-slate-600">Ten moduł jest w budowie.</p>
      <Link href="/" className="text-brand hover:underline">
        ← Wróć na stronę główną
      </Link>
    </main>
  );
}
