"use client";
import UploadForm from "@/components/add-form";

export default function CreatePage() {
  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        console.log("Form submitted successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to submit form:", errorData.message);
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };

  return (
    <>
      <UploadForm onSubmit={handleSubmit} isEdit={false} />
    </>
  );
}
