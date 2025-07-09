// src/components/PartsPagination.tsx
"use client";

import { Pagination } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  totalPages: number;
}

export default function PartsPagination({ totalPages }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", value.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={handlePageChange}
      color="primary"
      sx={{ mt: 3, display: "flex", justifyContent: "center" }}
    />
  );
}
