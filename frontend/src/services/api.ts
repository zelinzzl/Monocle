const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJSON = res.headers.get("content-type")?.includes("application/json");
  const body = isJSON ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(body?.error || "API request failed");
  }

  return body;
}
