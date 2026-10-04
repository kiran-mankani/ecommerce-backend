import cloudinary from "../config/cloudinary.js";

/**
 * Upload an in-memory file buffer to Cloudinary.
 * Resolves with the Cloudinary upload result (secure_url, public_id, ...).
 */
export const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

/**
 * Extract the Cloudinary public_id from a delivery URL, e.g.
 * https://res.cloudinary.com/<cloud>/image/upload/v123/ecommerce/products/abc.jpg
 *   -> "ecommerce/products/abc"
 * Returns null for URLs that aren't from our Cloudinary account.
 */
export const getPublicIdFromUrl = (url) => {
  if (typeof url !== "string") return null;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const match = url.match(
    /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i
  );
  if (!match || match[1] !== cloudName) return null;

  return decodeURIComponent(match[2]);
};

/**
 * Delete images from Cloudinary by URL. Non-Cloudinary URLs are skipped.
 * Never throws — a failed cleanup shouldn't break the request.
 */
export const deleteImagesFromCloudinary = async (urls = []) => {
  const publicIds = urls.map(getPublicIdFromUrl).filter(Boolean);
  if (publicIds.length === 0) return;

  await Promise.allSettled(
    publicIds.map((id) => cloudinary.uploader.destroy(id))
  ).then((results) =>
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Cloudinary delete failed for ${publicIds[i]}:`, r.reason);
      }
    })
  );
};
