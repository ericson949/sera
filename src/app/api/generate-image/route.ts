import { NextResponse } from "next/server";

// This route has been deactivated because recipe image URLs are already defined in the database.
export async function POST() {
  return new Response("Image generation route is deactivated.", { status: 404 });
}
