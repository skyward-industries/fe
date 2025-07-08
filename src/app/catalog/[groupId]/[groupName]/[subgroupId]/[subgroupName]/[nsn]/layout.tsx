// src/app/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/[nsn]/layout.tsx
import { fetchPartInfo, Part } from '@/services/fetchPartInfo';
import type { Metadata } from 'next';
import { capitalizeWords } from '@/utils/capitalizeWords';

// This function runs on the server to generate dynamic metadata for each NSN page
export async function generateMetadata({
  params,
}: {
  params: {
    nsn: string;
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  };
}): Promise<Metadata> {
  const cleanNSN = params.nsn.replace(/^nsn[-]?/i, "");
  const parts: Part[] = await fetchPartInfo(cleanNSN);

  const firstPart = parts.length > 0 ? parts[0] : null;

  // Safely get data for title/description/keywords, providing strong fallbacks
  const nsnValue = cleanNSN;
  const partNumberValue = firstPart?.part_number?.toUpperCase();
  const itemNameValue = firstPart?.item_name ? capitalizeWords(firstPart.item_name) : 'Defense & Aerospace Part';
  const companyNameValue = firstPart?.company_name ? capitalizeWords(firstPart.company_name) : 'Leading Supplier';
  const fsgTitleValue = firstPart?.fsg_title ? capitalizeWords(firstPart.fsg_title) : 'Military Components';
  const fscTitleValue = firstPart?.fsc_title ? capitalizeWords(firstPart.fsc_title) : 'Industrial Equipment';
  const definitionValue = firstPart?.definition;

  // --- Construct Dynamic SEO Metadata ---

  // Title: Prioritize Item Name > Part Number > FSC Title > Generic
  // This is the most important tag for search engines.
  const pageTitle = [itemNameValue, `NSN ${nsnValue}`, partNumberValue, fscTitleValue, "Skyward Industries"].filter(Boolean).join(' | ');

  // Description: This is the text that appears in search results. Make it compelling.
  const pageDescription = definitionValue || 
                          `Discover ${itemNameValue} with NSN ${nsnValue}${partNumberValue ? ` and part number ${partNumberValue}` : ''}. Get quotes and detailed information for military and defense procurement.`;
  
  // Keywords: While less important for Google, they help define context.
  const pageKeywords = [
    'NSN', nsnValue,
    'part number', partNumberValue,
    itemNameValue?.toLowerCase(),
    fsgTitleValue?.toLowerCase(), fscTitleValue?.toLowerCase(),
    companyNameValue?.toLowerCase(),
    'military parts', 'defense procurement', 'government supply', 'aerospace components', 'industrial equipment',
    'buy parts', 'RFQ', 'national stock number'
  ].filter(Boolean).join(', ');

  // Image URL: For social sharing.
  const imageUrl = firstPart?.fsg
    ? `https://www.skywardparts.com/category-images/${firstPart.fsg}/1.png`
    : `https://www.skywardparts.com/default-product.jpg`;

  // Canonical URL: Prevents duplicate content issues.
  const canonicalUrl = `https://www.skywardparts.com/catalog/${params.groupId}/${params.groupName}/${params.subgroupId}/${params.subgroupName}/${params.nsn}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: 'Skyward Industries',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${itemNameValue} NSN ${nsnValue} Image`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
      creator: '@yourtwitterhandle', // IMPORTANT: Replace with your actual Twitter handle
    },
  };
}

// Default layout component, just renders children
export default function NsnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}