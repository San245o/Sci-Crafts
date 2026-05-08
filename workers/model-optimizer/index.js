import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const maxJobs = Number(process.env.MAX_JOBS || 3);
const maxAttempts = Number(process.env.MAX_ATTEMPTS || 3);
const staleMinutes = Number(process.env.JOB_STALE_MINUTES || 15);
const workerDir = path.dirname(fileURLToPath(import.meta.url));
const gltfTransformBin = path.join(workerDir, "node_modules", ".bin", process.platform === "win32" ? "gltf-transform.cmd" : "gltf-transform");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!Number.isFinite(maxJobs) || maxJobs < 1) {
  throw new Error("MAX_JOBS must be a positive number");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function assertServiceRoleKey() {
  const payload = decodeJwtPayload(serviceRoleKey);
  if (payload?.role !== "service_role") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be the Supabase service_role secret key, not the anon key.");
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function optimizedPathFor(rawPath) {
  const parts = rawPath.split("/");
  parts[parts.length - 1] = "model-optimized.glb";
  return parts.join("/");
}

async function claimJob() {
  const staleCutoff = new Date(Date.now() - staleMinutes * 60_000).toISOString();

  const { data, error } = await supabase.rpc("claim_model_optimization_job", {
    max_attempts: maxAttempts,
    stale_before: staleCutoff,
  });

  if (error) throw error;
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function markFailed(product, error) {
  const message = error instanceof Error ? error.message : String(error);
  await supabase
    .from("products")
    .update({
      optimization_status: "failed",
      optimization_error: message.slice(0, 2000),
      optimization_locked_at: null,
    })
    .eq("id", product.id);
}

async function processJob(product) {
  if (!product.raw_model_path) {
    throw new Error("Product is missing raw_model_path");
  }

  const workdir = path.join(os.tmpdir(), `sci-crafts-${product.id}`);
  const inputPath = path.join(workdir, "input.glb");
  const outputPath = path.join(workdir, "output.glb");
  const optimizedPath = optimizedPathFor(product.raw_model_path);

  await rm(workdir, { recursive: true, force: true });
  await mkdir(workdir, { recursive: true });

  try {
    console.log(`Downloading ${product.raw_model_path}`);
    const { data: rawBlob, error: downloadError } = await supabase.storage
      .from("product-models-raw")
      .download(product.raw_model_path);

    if (downloadError) throw downloadError;
    if (!rawBlob) throw new Error("Downloaded raw model is empty");

    await writeFile(inputPath, Buffer.from(await rawBlob.arrayBuffer()));

    console.log(`Optimizing product ${product.id}`);
    await run(gltfTransformBin, [
      "optimize",
      inputPath,
      outputPath,
      "--compress",
      "draco",
      "--texture-compress",
      "webp",
    ]);

    const outputBuffer = await readFile(outputPath);

    console.log(`Uploading optimized model to ${optimizedPath}`);
    const { error: uploadError } = await supabase.storage
      .from("product-models")
      .upload(optimizedPath, outputBuffer, {
        contentType: "model/gltf-binary",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        model_path: optimizedPath,
        optimized_model_path: optimizedPath,
        optimized_size_bytes: outputBuffer.byteLength,
        model_size_bytes: outputBuffer.byteLength,
        optimization_status: "complete",
        optimization_error: null,
        optimization_locked_at: null,
        optimized_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (updateError) throw updateError;

    console.log(`Deleting raw model ${product.raw_model_path}`);
    const { error: removeError } = await supabase.storage
      .from("product-models-raw")
      .remove([product.raw_model_path]);

    if (removeError) {
      console.warn(`Optimized product ${product.id}, but raw cleanup failed: ${removeError.message}`);
    }

    console.log(`Completed product ${product.id}: ${product.original_size_bytes || "unknown"} -> ${outputBuffer.byteLength} bytes`);
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

async function runBatch() {
  assertServiceRoleKey();
  console.log(`Sci-Crafts model optimizer started. MAX_JOBS=${maxJobs}`);
  let processed = 0;

  while (processed < maxJobs) {
    const job = await claimJob();

    if (!job) {
      console.log("No pending optimization jobs.");
      break;
    }

    try {
      await processJob(job);
    } catch (error) {
      console.error(`Failed product ${job.id}`, error);
      await markFailed(job, error);
    }

    processed += 1;
  }

  console.log(`Optimizer finished. Jobs attempted: ${processed}`);
}

runBatch().catch((error) => {
  console.error("Optimizer crashed", error);
  process.exit(1);
});
