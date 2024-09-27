"use server";
import { createProduct } from "@/lib/product_action";

export async function POST(formData: FormData) {
  return createProduct(formData);
}
