import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Returns an optimized Cloudinary URL for a given public ID.
 */
export function getCloudinaryUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    quality: "auto",
    fetch_format: "auto",
    secure: true,
  });
}
