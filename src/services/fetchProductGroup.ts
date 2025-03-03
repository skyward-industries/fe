import { fetchProductById } from "./fetchPartInfo";

// Mock database of products and their corresponding groups
const productGroups = {
  "1": ["101", "102", "103"], // Group 1 contains products 101, 102, 103
  "2": ["201", "202"], // Group 2 contains products 201, 202
  "3": ["301", "302"], // Group 3 contains products 301, 302
};

// Function to dynamically determine the groupId from a productId
export async function fetchProductGroup(productId: string) {
  try {
    for (const [groupId, productIds] of Object.entries(productGroups)) {
      if (productIds.includes(productId)) {
        const product = await fetchProductById(groupId, productId);
        return { groupId, product };
      }
    }

    throw new Error("Product not found");
  } catch (error) {
    console.error("Error fetching product group:", error);
    throw new Error("Failed to determine product group");
  }
}
