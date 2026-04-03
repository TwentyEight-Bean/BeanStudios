import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("Mising file", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "bean_uploads" },
        (error: any, result: any) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(new NextResponse("Upload failed", { status: 500 }));
          }
          resolve(NextResponse.json(result));
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
