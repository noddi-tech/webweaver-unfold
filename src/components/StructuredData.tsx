interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Injects JSON-LD structured data into the page head for SEO.
 * Supports single schema objects or arrays of multiple schemas.
 * 
 * @example
 * <StructuredData data={{
 *   "@context": "https://schema.org",
 *   "@type": "Organization",
 *   "name": "Navio"
 * }} />
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
