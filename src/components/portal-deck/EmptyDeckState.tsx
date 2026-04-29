import { deckText } from "./i18n";

export function EmptyDeckState() {
  return (
    <section className="flex min-h-[45vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold text-muted-foreground">{deckText.emptyDeckTitle}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {deckText.emptyDeckBody}
      </p>
    </section>
  );
}
