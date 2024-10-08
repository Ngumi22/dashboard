"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ImagePreviewProps {
  file: File | null;
  onRemove: () => void;
  altText: string; // New prop for different images (e.g., "Brand Image", "Category Image")
}
const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove }) => {
  let objectUrl: string | undefined;

  if (file) {
    objectUrl = URL.createObjectURL(file);
  }

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl); // Cleanup URL to avoid memory leaks
      }
    };
  }, [objectUrl]);

  if (!file) return null;

  return (
    <div className="relative w-32 h-32">
      <Image
        src={objectUrl!}
        alt="Image Preview"
        height={100}
        width={100}
        className="rounded-md h-auto w-auto"
        onLoad={() => {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl); // Revoke URL after it's been used
          }
        }}
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-0 right-0 rounded-full"
        onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ImagePreview;
