import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiting: max 3 submissions per IP per hour
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps);
    return { allowed: false, remaining: 0 };
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return { allowed: true, remaining: RATE_LIMIT_MAX - timestamps.length };
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "dmca-ventures-admin";
const REPO_NAME = "AussieFuelSupply";

const LABEL_CONFIG = {
  bug: { name: "bug", color: "d73a4a", emoji: "🐛", title: "Bug Report" },
  feedback: { name: "feedback", color: "0075ca", emoji: "💬", title: "User Feedback" },
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "3600",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const { type, email, message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (type !== "bug" && type !== "feedback") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!GITHUB_TOKEN) {
      console.error("GITHUB_TOKEN not set");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const cfg = LABEL_CONFIG[type as "bug" | "feedback"];

    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };

    // Ensure the label exists (silently ignore 422 = already exists)
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/labels`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: cfg.name, color: cfg.color }),
    });

    const body = [
      `**Type:** ${cfg.title}`,
      `**Submitted:** ${new Date().toUTCString()}`,
      `**Email:** ${email?.trim() || "Not provided"}`,
      "",
      "---",
      "",
      message.trim(),
    ].join("\n");

    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: `${cfg.emoji} ${cfg.title}`,
          body,
          labels: [cfg.name],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("GitHub API error:", err);
      return NextResponse.json({ error: "Failed to create issue" }, { status: 502 });
    }

    const issue = await res.json();
    return NextResponse.json(
      { success: true, issueNumber: issue.number },
      {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  } catch (err) {
    console.error("submit-issue error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
