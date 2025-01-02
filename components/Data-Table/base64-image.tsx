"use client";

import React from "react";
import Image from "next/image";

interface Base64ImageProps {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
}

const Base64Image: React.FC<Base64ImageProps> = ({
  src,
  alt,
  width,
  height,
}) => {
  if (!src) {
    return (
      <div style={{ width, height, backgroundColor: "#f0f0f0" }}>No image</div>
    );
  }

  return (
    <div style={{ width, height, position: "relative" }}>
      <Image
        src={`data:image/jpeg;base64,${src}`}
        alt={alt}
        layout="fill"
        objectFit="cover"
      />
    </div>
  );
};

export default Base64Image;
