import { fetchPartInfo } from "@/services/fetchPartInfo";
import type { Metadata } from "next";

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
  const { nsn, groupId, groupName, subgroupId, subgroupName } = params;
  const cleanNSN = nsn.replace("nsn-", "").replace("NSN-", "");
  const parts = await fetchPartInfo(cleanNSN);
  const part = parts?.[0];

  if (!part) {
    throw new Error("No part found for NSN");
  }

  const {
    part_number,
    company_name,
    cage_code,
    item_name,
    fsg,
    fsc,
    fsg_title,
    fsc_title,
  } = part;

  if (!fsg || !fsc || !fsg_title || !fsc_title) {
    throw new Error("Missing FSG/FSC info in part record.");
  }

  const title = `NSN ${cleanNSN} | ${item_name || "Defense Part"} | ${company_name}`;
  const description = `Technical specifications, supplier data, and logistics for NSN ${cleanNSN} (${item_name || "Item"}). Manufactured by ${company_name} (CAGE: ${cage_code}) with part number ${part_number}.`;

  const canonical = `https://skywardparts.com/catalog/${fsg}/${fsg_title}/${fsc}/${fsc_title}/nsn-${cleanNSN}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    keywords: [
      cleanNSN,
      item_name,
      part_number,
      company_name,
      cage_code,
      "NSN parts",
      "military surplus",
      "defense logistics",
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Skyward Parts",
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    metadataBase: new URL("https://skywardparts.com"),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
