// parseVariantForm.ts
export async function parseVariantForm(formData: FormData): Promise<{
  variantId?: number;
  productId: number;
  variantPrice: number;
  variantQuantity: number;
  variantStatus: "active" | "inactive";
  specifications: {
    specificationId: number;
    value: string;
    variantValueId?: number;
  }[];
  images?: File[];
}> {
  const productId = Number(formData.get("productId"));
  const variantPrice = Number(formData.get("variantPrice"));
  const variantQuantity = Number(formData.get("variantQuantity"));
  const variantStatus = formData.get("variantStatus") as "active" | "inactive";
  const variantIdRaw = formData.get("variantId");
  const variantId = variantIdRaw ? Number(variantIdRaw) : undefined;

  // Get specifications as a JSON string and then parse it.
  let specifications: any[] = [];
  const specs = formData.get("specifications");
  if (specs && typeof specs === "string") {
    try {
      specifications = JSON.parse(specs);
    } catch (err) {
      console.error("Error parsing specifications JSON:", err);
    }
  }

  // Retrieve all image files (we use the key "images[]" when appending multiple files)
  const images = formData.getAll("images[]") as File[];

  return {
    productId,
    variantPrice,
    variantQuantity,
    variantStatus,
    specifications,
    images,
    ...(variantId ? { variantId } : {}),
  };
}
