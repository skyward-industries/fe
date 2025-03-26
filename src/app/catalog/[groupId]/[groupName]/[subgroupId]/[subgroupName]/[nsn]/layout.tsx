import { Metadata } from "next";
import { fetchPartInfo } from "@/services/fetchPartInfo";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ nsn: string }>;
}

// Function to generate dynamic metadata with API data
export async function generateMetadata(props: LayoutProps): Promise<Metadata> {
  const params = await props.params;
  const cleanNSN = params.nsn?.replace("nsn-", "").replace("NSN-", "");
  const parts = await fetchPartInfo(cleanNSN);

  // If no parts are found, return default metadata
  if (!parts || parts.length === 0) {
    return {
      title: `NSN ${cleanNSN} | Part Details`,
      description: `View details about NSN ${cleanNSN}, including manufacturer information, CAGE codes, and establishment details.`,
      alternates: {
        canonical: `https://www.skywardparts.com/catalog/nsn-${cleanNSN}`,
      },
    };
  }

  // Extract relevant data from the first part found
  const part = parts[0]; // Assuming first part is the most relevant
  const partNumber = part.part_number || "Unknown Part";
  const manufacturer = part.company_name || "Unknown Manufacturer";

  return {
    title: `NSN ${cleanNSN} - ${partNumber} | Part Details`,
    description: `Learn about NSN ${cleanNSN}: ${partNumber} by ${manufacturer}. Find manufacturer details, CAGE codes, and more at Skyward Industries.`,
    alternates: {
      canonical: `https://www.skywardparts.com/catalog/nsn-${cleanNSN}`,
    },
    openGraph: {
      title: `NSN ${cleanNSN} - ${partNumber} | Part Details`,
      description: `Detailed information about NSN ${cleanNSN}, including ${partNumber} by ${manufacturer}.`,
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
