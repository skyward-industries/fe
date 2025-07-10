// src/app/catalog/page.tsx
import CatalogClient from '@/components/CatalogClient';
import { fetchGroups } from '@/services/fetchGroups';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Product Groups | Skyward Industries Catalog',
  description: 'Explore the main product groups from Skyward Industries. Browse our catalog by Federal Supply Group (FSG) for all your aerospace and defense needs.',
  alternates: {
    canonical: 'https://www.skywardparts.com/catalog',
  },
};

export default async function CatalogPage() {
  let groups = [];
  try {
    groups = await fetchGroups();
  } catch (error) {
    console.error('Failed to fetch groups for catalog page:', error);
  }
  return <CatalogClient groups={groups} />;
}