import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const items = db.select().from(inventoryItems).all();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, location } = body as {
      items: { name: string; quantity: string; expiry_estimate: string }[];
      location: string;
    };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Items array required" }, { status: 400 });
    }

    const inserted = [];
    for (const item of items) {
      const rows = db
        .insert(inventoryItems)
        .values({
          name: item.name,
          category: location,
          quantity: item.quantity,
          expiryEstimate: item.expiry_estimate,
        })
        .returning()
        .all();
      inserted.push(rows[0]);
    }

    return NextResponse.json({ items: inserted, count: inserted.length });
  } catch (error) {
    console.error("Inventory save error:", error);
    return NextResponse.json({ error: "Failed to save inventory" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      db.delete(inventoryItems).where(eq(inventoryItems.id, parseInt(id))).run();
      return NextResponse.json({ success: true });
    }

    // Clear all
    const category = searchParams.get("category");
    if (category) {
      db.delete(inventoryItems).where(eq(inventoryItems.category, category)).run();
    } else {
      db.delete(inventoryItems).run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
