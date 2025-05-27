import { slugify } from "@/utils/slugify";
import { Metadata } from "next";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  }>;
}

export async function generateMetadata(props: LayoutProps): Promise<Metadata> {
  const params = await props.params;
  const formattedGroupName = params.subgroupName
    .replace("nsn-", "")
    .replace("NSN-")
    ?.replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    title: `${formattedGroupName} | Parts List`,
    description: `Browse parts under ${formattedGroupName} at Skyward Industries.`,
  };
}

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}
