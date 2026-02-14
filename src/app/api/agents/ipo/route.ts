import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const PYTHON = "/Users/jp/ipo-agent/venv/bin/python";
const AGENT = "/Users/jp/ipo-agent/agent.py";

export async function POST(req: NextRequest) {
    try {
        const { command = "upcoming" } = await req.json();

        const validCommands = ["upcoming", "week", "recent", "spac", "lockup", "filed"];
        if (!validCommands.includes(command)) {
            return NextResponse.json({ error: "Invalid command" }, { status: 400 });
        }

        const { stdout } = await execFileAsync(PYTHON, [AGENT, command], {
            timeout: 300000,
            maxBuffer: 5 * 1024 * 1024,
            cwd: "/Users/jp/ipo-agent",
            env: { ...process.env, CLAUDECODE: "" },
        });

        return NextResponse.json({ report: stdout.trim() });
    } catch (error: any) {
        if (error.killed) {
            return NextResponse.json({ error: "IPO fetch timed out" }, { status: 504 });
        }
        return NextResponse.json({ error: error.message || "IPO fetch failed" }, { status: 500 });
    }
}
