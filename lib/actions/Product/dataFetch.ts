"use server";

import { onSubmitAction } from "./actions/post";
import { updateProductAction } from "./actions/update";
import { handleDeleteAction } from "./actions/delete";

// Cache constants
const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Mutation actions
export async function createProductAction(prevState: any, data: FormData) {
  return onSubmitAction(prevState, data);
}

export async function updateProductActionWrapper(
  prevState: any,
  id: string,
  data: FormData
) {
  return updateProductAction(prevState, id, data);
}

export async function deleteProductAction(id: number) {
  return handleDeleteAction(id);
}
