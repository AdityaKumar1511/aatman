import Link from "next/link";

// Placeholder landing until the Phase 2 check-in flow exists.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold">Aatman</h1>
      <p className="text-muted">
        A quiet space for NIT Patna students to check in with themselves. The check-in is coming soon.
      </p>
      <Link
        href="/crisis"
        className="flex min-h-14 items-center justify-center rounded-2xl bg-accent px-5 font-semibold text-accent-foreground"
      >
        Need to talk to someone now?
      </Link>
    </main>
  );
}
