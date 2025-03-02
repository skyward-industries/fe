export async function fetchGroups() {
    try {
      const res = await fetch("http://localhost:3000/api/groups", { cache: "no-store" });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.statusText}`);
      }
  
      return res.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch product categories");
    }
  }
  