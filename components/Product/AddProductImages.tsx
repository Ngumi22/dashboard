"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

interface ProductImagesFormProps {
  onImagesChange: (images: {
    mainImage: File | null;
    thumbnails: File[];
  }) => void;
}

const AddProductImagesForm: React.FC<ProductImagesFormProps> = ({
  onImagesChange,
}) => {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<File[]>([]);

  // Handle Main Image Change
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (
      file &&
      file.size <= MAX_FILE_SIZE &&
      ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)
    ) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Thumbnail Change
  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0] || null;
    if (
      file &&
      file.size <= MAX_FILE_SIZE &&
      ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)
    ) {
      const newThumbnails = [...thumbnails];
      newThumbnails[index] = file;
      setThumbnails(newThumbnails);

      const newPreviews = [...thumbnailPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setThumbnailPreviews(newPreviews);
    }
  };

  // Send images back to parent when they change
  useEffect(() => {
    onImagesChange({ mainImage, thumbnails });
  }, [mainImage, thumbnails, onImagesChange]);

  // Cleanup URL objects when component unmounts
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      thumbnailPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [mainImagePreview, thumbnailPreviews]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div>
        <label>Main Image</label>
        <Input type="file" accept="image/*" onChange={handleMainImageChange} />
        {mainImagePreview && (
          <img
            src={mainImagePreview}
            alt="Main Image Preview"
            className="w-32 h-32"
          />
        )}
      </div>

      {/* Thumbnails */}
      <div>
        <label>Thumbnails</label>
        {[...Array(5)].map((_, index) => (
          <div key={index}>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleThumbnailChange(e, index)}
            />
            {thumbnailPreviews[index] && (
              <img
                src={thumbnailPreviews[index]}
                alt={`Thumbnail ${index + 1} Preview`}
                className="w-16 h-16"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProductImagesForm;
