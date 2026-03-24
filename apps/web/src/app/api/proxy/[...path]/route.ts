import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETRYABLE_METHODS = new Set(["GET", "HEAD"]);
const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const RETRY_DELAYS_MS = [0, 1500, 2500, 4000, 6000, 8000];
const FETCH_TIMEOUT_MS = 25000;

function resolveApiBase() {
  const raw = process.env.AGORA_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return raw.replace(/\/+$/, "");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isColdStartResponse(status: number, body: string) {
  if (!RETRYABLE_STATUSES.has(status)) return false;
  return /application loading|bad gateway|service unavailable|upstream connect|temporarily unavailable/i.test(
    body
  );
}

async function forward(request: NextRequest, path: string[]) {
  const upstream = new URL(`${resolveApiBase()}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = request.method.toUpperCase();
  const canHaveBody = !["GET", "HEAD"].includes(method);
  const body = canHaveBody ? await request.arrayBuffer() : undefined;
  const maxAttempts = RETRYABLE_METHODS.has(method) ? RETRY_DELAYS_MS.length : 1;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt]);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(upstream, {
        method,
        headers,
        body,
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (attempt < maxAttempts - 1 && RETRYABLE_STATUSES.has(response.status)) {
        const text = await response.clone().text().catch(() => "");
        if (isColdStartResponse(response.status, text)) {
          continue;
        }
      }

      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete("content-encoding");
      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt === maxAttempts - 1) break;
    }
  }

  return Response.json(
    {
      detail: "Upstream API is unavailable. Please retry in a few seconds.",
      error: lastError instanceof Error ? lastError.message : String(lastError ?? "unknown"),
    },
    { status: 503 }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path);
}
