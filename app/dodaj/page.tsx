"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Category, Visibility } from "@/lib/types";

// Mapa tylko po stronie klienta (Leaflet nie działa w SSR).
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] items-center justify-center rounded-xl border border-slate-300 text-slate-400">
      Ładowanie mapy…
    </div>
  ),
});

type Pos = { lat: number; lng: number };

export default function DodajPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  // pola formularza
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [pos, setPos] = useState<Pos | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [addressPrivate, setAddressPrivate] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [involvesChildren, setInvolvesChildren] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  // wydarzenia z udziałem dzieci — domyślnie "tylko z linkiem" (wymóg bezpieczeństwa)
  const effectiveVisibility: Visibility = involvesChildren ? "link_only" : visibility;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      setLoadingAuth(false);
    });
    supabase
      .from("categories")
      .select("*")
      .order("id")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const canSubmit = useMemo(
    () => title.trim() && categoryId !== "" && pos && startsAt,
    [title, categoryId, pos, startsAt]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Musisz być zalogowany, aby dodać wydarzenie.");
      return;
    }
    if (!pos) {
      setError("Wskaż miejsce na mapie.");
      return;
    }

    setSubmitting(true);

    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        organizer_id: userData.user.id,
        title: title.trim(),
        description: description.trim() || null,
        category_id: Number(categoryId),
        lat: pos.lat,
        lng: pos.lng,
        place_name: placeName.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        capacity: capacity ? Number(capacity) : null,
        visibility: effectiveVisibility,
        involves_children: involvesChildren,
      })
      .select()
      .single();

    if (insertError || !event) {
      setError(insertError?.message ?? "Nie udało się dodać wydarzenia.");
      setSubmitting(false);
      return;
    }

    // dokładny adres prywatny (opcjonalny) — do osobnej, chronionej tabeli
    if (addressPrivate.trim()) {
      await supabase.from("event_addresses").insert({
        event_id: event.id,
        address_private: addressPrivate.trim(),
      });
    }

    setCreatedId(event.id);
    setCreatedToken(event.share_token);
    setSubmitting(false);
  }

  if (loadingAuth) {
    return (
      <main className="mx-auto max-w-screen-sm px-5 py-8 text-slate-500">
        Ładowanie…
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col justify-center gap-4 px-5 py-8">
        <h1 className="text-2xl font-bold text-brand-dark">Dodaj wydarzenie</h1>
        <p className="text-slate-600">
          Aby dodać wydarzenie, najpierw się zaloguj.
        </p>
        <Link
          href="/login"
          className="rounded-2xl bg-brand px-5 py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark"
        >
          Przejdź do logowania
        </Link>
      </main>
    );
  }

  if (createdId) {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/w/${createdId}${
            effectiveVisibility === "link_only" ? `?t=${createdToken}` : ""
          }`
        : "";
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm flex-col justify-center gap-4 px-5 py-8">
        <h1 className="text-2xl font-bold text-brand-dark">Wydarzenie dodane! 🎉</h1>
        <p className="text-slate-600">Udostępnij link sąsiadom:</p>
        <code className="break-all rounded-xl bg-slate-100 p-3 text-sm">{shareUrl}</code>
        <Link href="/" className="rounded-2xl bg-brand px-5 py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark">
          Wróć na mapę
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm px-5 py-8">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← Wróć na stronę główną
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-brand-dark">
        Dodaj wydarzenie
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Tytuł *</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
            placeholder="np. Kiermasz ciast w parku"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Opis</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
            placeholder="Krótko opisz, co się wydarzy."
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Kategoria *</span>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
          >
            <option value="">— wybierz —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Miejsce na mapie *</span>
          <p className="text-sm text-slate-500">Kliknij na mapie, aby wskazać miejsce.</p>
          <LocationPicker value={pos} onChange={setPos} />
          {pos && (
            <p className="text-xs text-slate-400">
              Wybrano: {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
            </p>
          )}
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Nazwa miejsca (publiczna)</span>
          <input
            type="text"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
            placeholder="np. Park Jordana"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">
            Dokładny adres (prywatny)
          </span>
          <span className="text-sm text-slate-500">
            Widoczny dopiero po zapisie na wydarzenie.
          </span>
          <input
            type="text"
            value={addressPrivate}
            onChange={(e) => setAddressPrivate(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
            placeholder="np. ul. Przykładowa 5/10"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Termin *</span>
          <input
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Limit miejsc</span>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-brand"
            placeholder="puste = bez limitu"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={involvesChildren}
            onChange={(e) => setInvolvesChildren(e.target.checked)}
            className="h-5 w-5"
          />
          <span className="text-slate-700">
            Wydarzenie z udziałem dzieci
            <span className="block text-sm text-slate-500">
              Dla bezpieczeństwa zostanie ustawione jako „tylko z linkiem".
            </span>
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-medium text-slate-700">Widoczność</legend>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="visibility"
              checked={effectiveVisibility === "public"}
              disabled={involvesChildren}
              onChange={() => setVisibility("public")}
              className="h-5 w-5"
            />
            <span>Publiczne — widoczne na mapie</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="visibility"
              checked={effectiveVisibility === "link_only"}
              onChange={() => setVisibility("link_only")}
              className="h-5 w-5"
            />
            <span>Tylko z linkiem — niewidoczne na mapie</span>
          </label>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="rounded-2xl bg-brand px-5 py-4 text-lg font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Dodawanie…" : "Dodaj wydarzenie"}
        </button>
      </form>
    </main>
  );
}
