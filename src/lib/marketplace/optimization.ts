import type { Product } from "./types";

export function optimizationLabel(status: Product["optimization_status"]) {
  switch (status) {
    case "pending":
      return "Optimization pending";
    case "processing":
      return "Optimizing";
    case "complete":
      return "Ready";
    case "failed":
      return "Optimization failed";
    default:
      return "Unknown";
  }
}

export function isModelReady(product: Pick<Product, "optimization_status" | "model_path">) {
  return product.optimization_status === "complete" && Boolean(product.model_path);
}
