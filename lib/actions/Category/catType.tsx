// Define the Category type
export type Category = {
  category_id: number;
  category_name: string;
  category_image: string | File | null; // Update type to match the encoded base64 image
  category_description: string;
  category_status: "Active" | "Inactive";
};
