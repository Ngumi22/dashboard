"use client";

export default function Loading({ fullScreen = true }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: fullScreen ? "100vh" : "auto",
        width: "100%",
        backgroundColor: "black",
      }}
      aria-busy="true"
      aria-live="polite">
      <div className="loader" style={{ textAlign: "center" }}></div>
    </div>
  );
}
