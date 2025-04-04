import { Metadata } from "next";
import { fetchPartInfo } from "@/services/fetchPartInfo";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ nsn: string }>;
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
        canonical: `https://www.skywardparts.com/catalog/nsn-${cleanNSN || params.nsn}`,
      },
    };
  }

  const part = parts[0];
  const partNumber = part.part_number || "Unknown Part";
  const manufacturer = part.company_name || "Unknown Manufacturer";
  const cageCode = part.cage_code || "Unknown Cage Code";

  return {
    title: `NSN ${cleanNSN} - ${partNumber} | Part Details`,
    description: `Learn about NSN ${cleanNSN}: ${partNumber} by ${manufacturer}. Find manufacturer details, CAGE codes, and more at Skyward Industries.`,
    openGraph: {
      title: `NSN ${cleanNSN} - ${partNumber} | Part Details`,
      description: `Detailed information about NSN ${cleanNSN}, including ${partNumber} by ${manufacturer}. Cage Code: ${cageCode}.`,
      url: `https://www.skywardparts.com/catalog/nsn-${cleanNSN}`,
      siteName: "Skyward Industries",
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
