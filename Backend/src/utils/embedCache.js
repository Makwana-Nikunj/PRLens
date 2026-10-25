import crypto from "crypto";

/**
 * In-process LRU cache for embedding vectors.
 *
 * Why this exists:
 *  - The same chunk text can be re-embedded many times in this process: re-analyzing
 *    the same PR, the chat pipeline querying a chunk that was just indexed, a
 *    background reindex job, etc. Each one costs a Gemini API call.
 *  - The vector for a given text is deterministic for a fixed embedding model, so
 *    we can cache by content hash without staleness.
 *
 * Contract:
 *  - Key = sha256(text) over the raw input string.
 *  - Value = number[] (the embedding vector).
 *  - Capacity is bounded; oldest entries are evicted on insert when full.
 *  - Cache lives in process memory. Multiple server instances each have their own.
 *    Swapping the embedding model requires a process restart (the cache key is
 *    content-only, not model-aware).
 */
class EmbedCache {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxSize=2000] Hard cap on entries. Sized to hold ~2 PRs
   *   of mid-size file chunks (~10 MB at 1536 dims, 4 bytes per number).
   */
  constructor({ maxSize = 2000 } = {}) {
    if (!Number.isInteger(maxSize) || maxSize <= 0) {
      throw new Error("embedCache: maxSize must be a positive integer");
    }
    this.maxSize = maxSize;
    /** @type {Map<string, number[]>} */
    this.map = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Hash a string with sha256. Trims input before hashing so leading/trailing
   * whitespace from upstream chunkers doesn't fork the cache.
   * @param {string} text
   * @returns {string}
   */
  _key(text) {
    return crypto.createHash("sha256").update(String(text).trim()).digest("hex");
  }

  /**
   * Look up a key directly. Returns undefined on miss.
   * @param {string} text
   * @returns {number[] | undefined}
   */
  get(text) {
    if (!text) return undefined;
    const k = this._key(text);
    const v = this.map.get(k);
    if (v === undefined) {
      return undefined;
    }
    this.hits++;
    // Touch for LRU: re-insert to move to insertion-order tail.
    this.map.delete(k);
    this.map.set(k, v);
    return v;
  }

  /**
   * Async get-or-compute. On miss, awaits `compute(text)` and stores the result.
   * Concurrent calls with the same key may both invoke `compute`; the last write
   * wins. For an embedding model that is deterministic for the same input, this
   * is safe (writes are equal). The dedup win is for sequential calls.
   * @template T
   * @param {string} text
   * @param {(text: string) => Promise<T>} compute
   * @returns {Promise<T>}
   */
  async getOrCompute(text, compute) {
    const hit = this.get(text);
    if (hit !== undefined) return hit;
    this.misses++;
    const value = await compute(text);
    this.set(text, value);
    return value;
  }

  /**
   * Sync variant. `compute` must return the value synchronously.
   * @template T
   * @param {string} text
   * @param {(text: string) => T} compute
   * @returns {T}
   */
  getOrComputeSync(text, compute) {
    const hit = this.get(text);
    if (hit !== undefined) return hit;
    this.misses++;
    const value = compute(text);
    this.set(text, value);
    return value;
  }

  /**
   * Insert directly. Trims oldest entries when over capacity.
   * @param {string} text
   * @param {number[]} value
   */
  set(text, value) {
    if (!text || value === undefined || value === null) return;
    const k = this._key(text);
    if (this.map.has(k)) {
      this.map.delete(k);
    }
    this.map.set(k, value);
    while (this.map.size > this.maxSize) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }

  /**
   * Hit/miss/size telemetry.
   * @returns {{ size: number, maxSize: number, hits: number, misses: number, hitRate: number }}
   */
  stats() {
    const total = this.hits + this.misses;
    return {
      size: this.map.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : this.hits / total,
    };
  }

  /** Reset all entries and counters. */
  clear() {
    this.map.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

// Singleton — one cache per Node process.
// Capacity chosen to fit ~2 mid-size PRs (~10 MB at 1536 dims).
const embedCache = new EmbedCache({ maxSize: 2000 });

export { EmbedCache, embedCache };
export default embedCache;
