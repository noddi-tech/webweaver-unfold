import { StructuredData } from './StructuredData';

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

/**
 * Generates BreadcrumbList JSON-LD structured data for SEO.
 * The last item should not have a URL (it's the current page).
 * 
 * @example
 * <BreadcrumbJsonLd 
 *   items={[
 *     { name: 'Home', url: '/' },
 *     { name: 'Blog', url: '/blog' },
 *     { name: 'Article Title' }
 *   ]} 
 * />
 */
export function BreadcrumbJsonLd({ items, baseUrl = 'https://noddi.tech' }: BreadcrumbJsonLdProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": `${baseUrl}${item.url}` })
    }))
  };

  return <StructuredData data={breadcrumbData} />;
}
