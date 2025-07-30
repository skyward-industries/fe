import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
}

const StructuredDataBreadcrumbs: React.FC<StructuredDataBreadcrumbsProps> = ({ breadcrumbs }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
};

export default StructuredDataBreadcrumbs;