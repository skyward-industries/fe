export async function fetchProductById(groupId: string, productId: string) {
    try {
      const res = await fetch(`http://localhost:3000/api/products/${groupId}/${productId}`, { cache: "no-store" });
  
      if (!res.ok) {
        throw new Error(`Product not found`);
      }
  
      return res.json();
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("Failed to fetch product");
    }
  }
  