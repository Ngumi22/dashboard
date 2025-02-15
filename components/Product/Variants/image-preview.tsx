"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImagePreviewProps {
  file: File;
}

export function ImagePreview({ file }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!preview) {
    return null;
  }

  return (
    <div className="relative h-20 w-20">
      <Image
        src={preview || "/placeholder.svg"}
        alt="Preview"
        fill
        style={{ objectFit: "cover" }}
        className="rounded-md"
      />
    </div>
  );
}
