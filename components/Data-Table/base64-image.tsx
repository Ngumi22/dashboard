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
  if (!src) {
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
      src={`data:image/jpeg;base64,${src}`} // Ensure src matches the correct format
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: "cover", borderRadius: "4px" }} // Optional styling
    />
  );
};

export default Base64Image;
