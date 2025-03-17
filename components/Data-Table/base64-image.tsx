import React from "react";
import Image from "next/image";

interface Base64ImageProps {
  src: string | null | undefined | Buffer;
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
  let imageSrc: string | null = null;

  if (src instanceof Buffer) {
    imageSrc = src.toString("base64");
  } else if (typeof src === "string") {
    imageSrc = src;
  }

  if (!imageSrc) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          color: "#888",
        }}>
        No image
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: "cover", borderRadius: "4px" }}
    />
  );
};

export default Base64Image;
