"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Mały wskaźnik, że aplikacja jest połączona z bazą Supabase.
// Pobiera liczbę kategorii — jeśli działa, cały łańcuch (env + klucz + RLS) jest OK.
export default function ConnectionCheck() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) {
          setStatus("error");
        } else {
          setCount(count ?? 0);
          setStatus("ok");
        }
      });
  }, []);

  return (
    <p className="mt-4 text-center text-xs text-slate-400">
      {status === "loading" && "Łączenie z bazą…"}
      {status === "ok" && `✅ Połączono z bazą (${count} kategorii)`}
      {status === "error" && "⚠️ Brak połączenia z bazą — sprawdź .env.local"}
    </p>
  );
}
