import { NextResponse } from "next/server";
import { createApiResponse } from "@/lib/api-helper";

export async function handleApiSuccess<T>(
  data: T,
  message?: string,
  status?: number
): Promise<NextResponse> {
  return NextResponse.json(createApiResponse(data, message), { status });
}

export async function handleApiErrorNext(
  message: string,
  context?: string,
  status?: number
): Promise<NextResponse> {
  return handleApiErrorNext(message, context, status);
}
