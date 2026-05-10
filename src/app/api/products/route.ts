import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSellerProfileComplete, type SellerProfile } from "@/lib/marketplace/seller-profile";

export const runtime = "nodejs";

const MAX_MODEL_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MODEL_TYPES = new Set(["model/gltf-binary", "application/octet-stream"]);
const ZIP_TYPES = new Set(["application/zip", "application/x-zip-compressed", "application/octet-stream"]);

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

function profileName(user: User) {
  const metadata = user.user_metadata;
  const name =
    typeof metadata?.full_name === "string" ? metadata.full_name :
    typeof metadata?.name === "string" ? metadata.name :
    typeof user.email === "string" ? user.email.split("@")[0] :
    `User ${user.id.slice(0, 8)}`;

  return name.slice(0, 120);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before uploading a model." }, { status: 401 });
  }

  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("city, pincode, location, printers")
    .eq("id", userData.user.id)
    .maybeSingle<SellerProfile>();

  if (!isSellerProfileComplete(sellerProfile)) {
    return NextResponse.json({ error: "Complete seller verification before uploading a model." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const category = stringValue(formData, "category");
  const price = Number(stringValue(formData, "price"));
  const model = formData.get("model");
  const images = formData.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);

  if (!title || !description || !category || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Title, description, category, and a valid INR price are required." }, { status: 400 });
  }

  if (!(model instanceof File) || model.size === 0) {
    return NextResponse.json({ error: "A .glb model or .zip CAD/STL package is required." }, { status: 400 });
  }

  const modelName = model.name.toLowerCase();
  const modelFileType = modelName.endsWith(".glb") ? "glb" : modelName.endsWith(".zip") ? "zip" : null;

  if (!modelFileType) {
    return NextResponse.json({ error: "Upload a .glb model or a .zip package containing CAD/STL files." }, { status: 400 });
  }

  if (modelFileType === "glb" && model.type && !MODEL_TYPES.has(model.type)) {
    return NextResponse.json({ error: "GLB uploads must use a GLB-compatible file type." }, { status: 400 });
  }

  if (modelFileType === "zip" && model.type && !ZIP_TYPES.has(model.type)) {
    return NextResponse.json({ error: "CAD/STL packages must be uploaded as a .zip file." }, { status: 400 });
  }

  if (model.size > MAX_MODEL_BYTES) {
    return NextResponse.json({ error: "Model must be 15 MB or smaller." }, { status: 400 });
  }

  for (const image of images) {
    if (!IMAGE_TYPES.has(image.type)) {
      return NextResponse.json({ error: "Images must be JPG, PNG, WEBP, or GIF." }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Each image must be 5 MB or smaller." }, { status: 400 });
    }
  }

  const productId = crypto.randomUUID();
  const userId = userData.user.id;
  const basePath = `${userId}/${productId}`;
  const modelStoragePath = `${basePath}/original-${safeName(model.name)}`;
  const avatarUrl = typeof userData.user.user_metadata?.avatar_url === "string" ? userData.user.user_metadata.avatar_url : null;

  await supabase.from("profiles").upsert({
    id: userId,
    display_name: profileName(userData.user),
    avatar_url: avatarUrl,
  });

  const modelBucket = modelFileType === "glb" ? "product-models-raw" : "product-models";
  const modelUpload = await supabase.storage.from(modelBucket).upload(modelStoragePath, model, {
    contentType: model.type || (modelFileType === "glb" ? "model/gltf-binary" : "application/zip"),
    upsert: false,
  });

  if (modelUpload.error) {
    return NextResponse.json({ error: modelUpload.error.message }, { status: 500 });
  }

  const imagePaths: string[] = [];
  for (const [index, image] of images.entries()) {
    const imagePath = `${basePath}/image-${index + 1}-${safeName(image.name)}`;
    const upload = await supabase.storage.from("product-images").upload(imagePath, image, {
      contentType: image.type,
      upsert: false,
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    imagePaths.push(imagePath);
  }

  const { error } = await supabase.from("products").insert({
    id: productId,
    owner_id: userId,
    title,
    description,
    category,
    price_cents: Math.round(price * 100),
    image_paths: imagePaths,
    model_file_type: modelFileType,
    model_file_name: model.name,
    raw_model_path: modelFileType === "glb" ? modelStoragePath : null,
    model_path: modelStoragePath,
    optimized_model_path: modelFileType === "zip" ? modelStoragePath : null,
    original_size_bytes: model.size,
    model_size_bytes: model.size,
    optimization_status: modelFileType === "glb" ? "pending" : "complete",
    optimization_error: null,
    optimization_attempts: 0,
    is_published: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: productId });
}
