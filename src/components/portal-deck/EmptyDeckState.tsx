export function EmptyDeckState() {
  return (
    <section className="flex min-h-[45vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold text-muted-foreground">The deck is being prepared</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Check back shortly. The Navio team is finalizing materials.
      </p>
    </section>
  );
}
