"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  return (
    <form
      className="mt-6 flex max-w-md items-center gap-1 rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 focus-within:ring-lime"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          toast.error("Ange en giltig e-postadress");
          return;
        }
        toast.success("Tack! Du är nu prenumerant", { description: "Vi skickar nya lokaler till " + email });
        setEmail("");
      }}
    >
      <label htmlFor="newsletter" className="sr-only">
        E-postadress
      </label>
      <input
        id="newsletter"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="din@epost.se"
        className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none"
      />
      <button
        type="submit"
        className="group inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition-transform active:scale-[0.97]"
      >
        Prenumerera
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
