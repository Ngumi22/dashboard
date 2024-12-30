// Define the Category type
export type Category = {
  category_id: string;
  category_name: string;
  category_image: string | null; // Update type to match the encoded base64 image
  category_description: string;
  status: "active" | "inactive";
};
