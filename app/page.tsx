import Link from "next/link";
import ConnectionCheck from "@/components/ConnectionCheck";

const NAV = [
  { href: "/", label: "Mapa wydarzeń", icon: "🗺️", desc: "Zobacz, co dzieje się w okolicy" },
  { href: "/dodaj", label: "Dodaj wydarzenie", icon: "➕", desc: "Zaproś sąsiadów w minutę" },
  { href: "/czat", label: "Czaty", icon: "💬", desc: "Rozmowy według kategorii" },
  { href: "/ogloszenia", label: "Ogłoszenia", icon: "📌", desc: "Krótkie wpisy sąsiedzkie" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col gap-6 px-5 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
          Sąsiedzko 🗺️
        </h1>
        <p className="text-lg text-slate-600">
          Mapa Krakowa z wydarzeniami organizowanymi przez mieszkańców.
        </p>
      </header>

      <nav className="grid gap-4">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow-md active:scale-[0.99]"
          >
            <span className="text-3xl" aria-hidden>
              {item.icon}
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-semibold text-slate-900">
                {item.label}
              </span>
              <span className="text-sm text-slate-500">{item.desc}</span>
            </span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Link
          href="/login"
          className="block w-full rounded-2xl bg-brand px-5 py-4 text-center text-lg font-semibold text-white shadow-sm transition hover:bg-brand-dark active:scale-[0.99]"
        >
          Zaloguj się
        </Link>
        <ConnectionCheck />
      </div>
    </main>
  );
}
