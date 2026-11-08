import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { sanitizeTopic, verifyAdminAuth } from "@/lib/security";

const execFileAsync = promisify(execFile);

/**
 * Runs the local research-agent Python script. It only works on a machine that
 * has the agent installed, so it's off unless both env vars point at it:
 *   RESEARCH_AGENT_PYTHON  e.g. /path/to/research-agent/venv/bin/python
 *   RESEARCH_AGENT_SCRIPT  e.g. /path/to/research-agent/agent.py
 * Admin only: a single run can take up to 10 minutes.
 */
export async function POST(req: NextRequest) {
    const python = process.env.RESEARCH_AGENT_PYTHON;
    const script = process.env.RESEARCH_AGENT_SCRIPT;
    if (!python || !script) {
        return NextResponse.json({ error: "The research agent isn't set up on this server." }, { status: 503 });
    }

    if (!(await verifyAdminAuth(req))) {
        return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
    }

    try {
        const { topic, depth = "quick" } = await req.json();
        const checked = sanitizeTopic(String(topic ?? ""));
        if (!checked.valid) {
            return NextResponse.json({ error: checked.error }, { status: 400 });
        }

        const validDepths = ["quick", "standard", "deep"];
        if (!validDepths.includes(depth)) {
            return NextResponse.json({ error: "Invalid depth" }, { status: 400 });
        }

        const { stdout } = await execFileAsync(python, [script, checked.sanitized, "--depth", depth], {
            timeout: 600000,
            maxBuffer: 10 * 1024 * 1024,
            env: { ...process.env, CLAUDECODE: "" },
        });

        return NextResponse.json({ report: stdout.trim() });
    } catch (error: any) {
        if (error.killed) {
            return NextResponse.json({ error: "Research timed out" }, { status: 504 });
        }
        return NextResponse.json({ error: "Research failed" }, { status: 500 });
    }
}
