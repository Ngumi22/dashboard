import sharp from "sharp";

export async function compressAndEncodeBase64(
  buffer: Buffer | null
): Promise<string | null> {
  if (!buffer) return null;

  try {
    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 100 })
      .toBuffer();

    // Explicitly add the data URL prefix
    return `data:image/webp;base64,${compressedBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Image compression error:", error);
    return null;
  }
}
