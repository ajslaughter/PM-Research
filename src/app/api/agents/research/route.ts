import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const PYTHON = "/Users/jp/research-agent/venv/bin/python";
const AGENT = "/Users/jp/research-agent/agent.py";

export async function POST(req: NextRequest) {
    try {
        const { topic, depth = "quick" } = await req.json();
        if (!topic?.trim()) {
            return NextResponse.json({ error: "Topic required" }, { status: 400 });
        }

        const validDepths = ["quick", "standard", "deep"];
        if (!validDepths.includes(depth)) {
            return NextResponse.json({ error: "Invalid depth" }, { status: 400 });
        }

        const { stdout } = await execFileAsync(
            PYTHON,
            [AGENT, topic.trim(), "--depth", depth],
            { timeout: 600000, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, CLAUDECODE: "" } }
        );

        return NextResponse.json({ report: stdout.trim() });
    } catch (error: any) {
        if (error.killed) {
            return NextResponse.json({ error: "Research timed out" }, { status: 504 });
        }
        return NextResponse.json({ error: error.message || "Research failed" }, { status: 500 });
    }
}
