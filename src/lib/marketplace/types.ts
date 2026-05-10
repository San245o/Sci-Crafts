export type Product = {
  id: string;
  owner_id: string | null;
  title: string;
  description: string;
  price_cents: number;
  category: string;
  image_paths: string[];
  model_path: string | null;
  model_size_bytes: number | null;
  model_file_type: "glb" | "zip";
  model_file_name: string | null;
  raw_model_path: string | null;
  optimized_model_path: string | null;
  original_size_bytes: number | null;
  optimized_size_bytes: number | null;
  optimization_status: "pending" | "processing" | "complete" | "failed";
  optimization_error: string | null;
  optimization_attempts: number;
  optimization_locked_at: string | null;
  optimized_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithUrls = Product & {
  imageUrls: string[];
  modelUrl: string | null;
};
