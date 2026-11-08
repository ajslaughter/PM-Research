import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { dirname } from "path";
import { promisify } from "util";
import { verifyAdminAuth } from "@/lib/security";

const execFileAsync = promisify(execFile);

/**
 * Runs the local IPO-agent Python script. Off unless both env vars point at it:
 *   IPO_AGENT_PYTHON  e.g. /path/to/ipo-agent/venv/bin/python
 *   IPO_AGENT_SCRIPT  e.g. /path/to/ipo-agent/agent.py
 * Admin only.
 */
export async function POST(req: NextRequest) {
    const python = process.env.IPO_AGENT_PYTHON;
    const script = process.env.IPO_AGENT_SCRIPT;
    if (!python || !script) {
        return NextResponse.json({ error: "The IPO agent isn't set up on this server." }, { status: 503 });
    }

    if (!(await verifyAdminAuth(req))) {
        return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
    }

    try {
        const { command = "upcoming" } = await req.json();

        const validCommands = ["upcoming", "week", "recent", "spac", "lockup", "filed"];
        if (!validCommands.includes(command)) {
            return NextResponse.json({ error: "Invalid command" }, { status: 400 });
        }

        const { stdout } = await execFileAsync(python, [script, command], {
            timeout: 300000,
            maxBuffer: 5 * 1024 * 1024,
            cwd: dirname(script),
            env: { ...process.env, CLAUDECODE: "" },
        });

        return NextResponse.json({ report: stdout.trim() });
    } catch (error: any) {
        if (error.killed) {
            return NextResponse.json({ error: "IPO fetch timed out" }, { status: 504 });
        }
        return NextResponse.json({ error: "IPO fetch failed" }, { status: 500 });
    }
}
