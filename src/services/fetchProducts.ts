export async function fetchProducts(groupId: string) {
    try {
      const res = await fetch(`http://localhost:3000/api/products/${groupId}`, { cache: "no-store" });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.statusText}`);
      }
  
      return res.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch product list");
    }
  }