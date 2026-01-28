import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems, inventorySnapshots } from "@/lib/db/schema";
import { analyzeInventoryImage } from "@/lib/anthropic";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const location = (formData.get("location") as string) || "fridge";

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Save image to disk
    const uploadDir = path.join(process.cwd(), "data", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${location}_${timestamp}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Convert to base64 for Claude Vision
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    // Analyze with Claude Vision
    const { items, rawResponse } = await analyzeInventoryImage(
      base64,
      mimeType,
      location as "pantry" | "fridge" | "freezer"
    );

    // Save snapshot record
    const snapshot = db
      .insert(inventorySnapshots)
      .values({
        imagePath: `uploads/${filename}`,
        location,
        rawResponse,
      })
      .returning()
      .all()[0];

    return NextResponse.json({
      snapshot,
      detectedItems: items,
      message: `Detected ${items.length} items in your ${location}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
