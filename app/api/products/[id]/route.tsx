import { NextRequest, NextResponse } from "next/server";
import { fetchProductByIdFromDb } from "@/lib/data";
import { handleDelete, handlePut } from "@/lib/actions";
import { authMiddleware } from "@/lib/auth-middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Ensure the return type is NextResponse
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const product = await fetchProductByIdFromDb(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 }); // Wrap the product in NextResponse
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await authMiddleware(req);

  const user = (req as any).user;
  const isAdmin = user.role === "Admin";

  const response = await handlePut(req, params.id);

  if (!isAdmin) {
    if (response.body) {
      const reader = response.body.getReader();
      const { value } = await reader.read();
      const decodedValue = new TextDecoder().decode(value);
      const responseBody = JSON.parse(decodedValue);

      responseBody.status = "draft";
      const updatedResponse = NextResponse.json(responseBody, {
        status: response.status,
      });
      return updatedResponse;
    } else {
      const responseBody = await response.json();
      responseBody.status = "draft";
      return NextResponse.json(responseBody, { status: response.status });
    }
  }

  return response;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await authMiddleware(req);

  const user = (req as any).user;
  if (user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = await handleDelete(req, params.id);
  return response;
}
