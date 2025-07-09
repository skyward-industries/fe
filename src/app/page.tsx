// src/app/page.tsx
// This is a Server Component. It runs only on the server.
// @ts-ignore
import { fetchGroups } from "@/services/fetchGroups";
// @ts-ignore
import HomePageClient from "@/components/HomePageClient"; // Import the new Client Component

export default async function Home() {
  // 1. Fetch data on the server, before the page is sent to the client.
  const allGroups = await fetchGroups();

  // 2. Define SEO metadata here. It gets rendered into the static HTML.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Skyward Industries, LLC",
    "url": "https://www.skywardparts.com",
    "logo": "https://www.skywardparts.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-321-351-2875",
      "contactType": "Customer Service",
      "email": "admin@skywardparts.com"
    },
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "449 Blakey Blvd",
        "addressLocality": "Cocoa Beach",
        "addressRegion": "FL",
        "postalCode": "32931",
        "addressCountry": "US"
    },
    "sameAs": []
  };

  // 3. Render the Client Component, passing the fetched data as a prop.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HomePageClient groups={allGroups} />
    </>
  );
}