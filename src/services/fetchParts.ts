export interface Part {
  id: string;
  nsn: string;
  fsg: string;
  fsc: string;
}
export async function fetchParts(fsc: string) : Promise<Part[]> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parts/${fsc}`);
  
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.statusText}`);
      }
  
      return res.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch product list");
    }
  }