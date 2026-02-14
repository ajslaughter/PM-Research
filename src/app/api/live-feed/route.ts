import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const FEED_PATH = path.join(process.env.HOME || "/Users/jp", ".finviz-bot/pm-live-feed.json");

export async function GET() {
    try {
        if (!existsSync(FEED_PATH)) {
            return NextResponse.json({ feed: [] });
        }
        const raw = await readFile(FEED_PATH, "utf-8");
        const feed = JSON.parse(raw);
        return NextResponse.json({ feed });
    } catch {
        return NextResponse.json({ feed: [] });
    }
}
