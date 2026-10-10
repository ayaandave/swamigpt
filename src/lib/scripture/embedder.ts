// The small meaning-search model, shipped with the site in data/models (no downloads at runtime,
// which also matters on Vercel where node_modules is read-only). The compressed q8 version is
// about a quarter of the size of the full one, with nearly the same results.
import path from "node:path";
import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

export const MODEL = "Xenova/bge-small-en-v1.5";
export const DTYPE = "q8";
// bge models expect this prefix on queries (not on the passages)
export const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

env.localModelPath = path.join(process.cwd(), "data/models/");
env.allowRemoteModels = false;

let embedder: Promise<FeatureExtractionPipeline> | undefined;
export const getEmbedder = () => (embedder ??= pipeline("feature-extraction", MODEL, { dtype: DTYPE }));
