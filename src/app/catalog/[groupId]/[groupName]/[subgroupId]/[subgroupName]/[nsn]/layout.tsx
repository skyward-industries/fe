import { Metadata } from "next";
import { fetchPartInfo } from "@/services/fetchPartInfo";
import { slugify } from "@/utils/slugify";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    nsn: string;
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  }>;
}

export async function generateMetadata(props: LayoutProps): Promise<Metadata> {
  const params = await props.params;
  const cleanNSN = params.nsn?.replace("nsn-", "").replace("NSN-", "");
  const parts = await fetchPartInfo(cleanNSN);

  if (!parts || parts.length === 0) {
    return {
      title: `NSN ${cleanNSN} | Part Details`,
      description: `View details about NSN ${cleanNSN}, including manufacturer information, CAGE codes, and establishment details.`,
      alternates: {
        canonical: `https://www.skywardparts.com/catalog/${
          params.groupId
        }/${slugify(params.groupName)}/${params.subgroupId}/${slugify(
          params.subgroupName
        )}/nsn-${cleanNSN}`,
      },
      keywords: [
        cleanNSN,
        partNumber,
        manufacturer,
        cageCode,
        "National Stock Number",
        "NSN Lookup",
        "NSN " + cleanNSN,
      ],
    };
  }

  const part = parts[0];
  const partNumber = part.part_number || "Unknown Part";
  const manufacturer = part.company_name || "Unknown Manufacturer";
  const cageCode = part.cage_code || "Unknown Cage Code";

  return {
    title: `NSN ${cleanNSN} - ${partNumber} | Part Details`,
    description: `Learn about NSN ${cleanNSN}: ${partNumber} by ${manufacturer}. Find manufacturer details, CAGE codes, and more at Skyward Industries.`,
    alternates: {
      canonical: `https://www.skywardparts.com/catalog/${
        params.groupId
      }/${slugify(params.groupName)}/${params.subgroupId}/${slugify(
        params.subgroupName
      )}/nsn-${cleanNSN}`,
    },
    keywords: [
      cleanNSN,
      partNumber,
      manufacturer,
      cageCode,
      "National Stock Number",
      "NSN Lookup",
      "NSN " + cleanNSN,
    ],
    openGraph: {
      title: `NSN ${cleanNSN} - ${partNumber} | Part Details`,
      description: `Detailed information about NSN ${cleanNSN}, including ${partNumber} by ${manufacturer}. Cage Code: ${cageCode}.`,
      url: `https://www.skywardparts.com/catalog/${params.groupId}/${slugify(
        params.groupName
      )}/${params.subgroupId}/${slugify(params.subgroupName)}/nsn-${cleanNSN}`,
      siteName: "Skyward Parts",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `NSN ${cleanNSN} - ${partNumber}`,
      description: `Find details on NSN ${cleanNSN}, including part ${partNumber} from ${manufacturer}.`,
    },
  };
}

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}
