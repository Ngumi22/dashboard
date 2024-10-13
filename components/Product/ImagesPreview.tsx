"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
  altText: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onRemove,
  altText,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | undefined>();

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  if (!file) return null;

  return (
    <div className="relative w-32 h-32">
      <Image
        src={objectUrl!}
        alt={altText}
        height={128}
        width={128}
        className="rounded-md h-32 w-32 object-cover"
        onLoad={() => {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
        }}
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-0 right-0 rounded-full"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
