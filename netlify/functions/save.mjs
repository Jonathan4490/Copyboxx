import { getStore } from "@netlify/blobs";

const MAX_BYTES = 400 * 1024; // จำกัดขนาดต่อลิงก์ ~400 KB
const CHARS = "abcdefghijkmnpqrstuvwxyz23456789";

function makeId(len = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let id = "";
  for (const b of bytes) id += CHARS[b % CHARS.length];
  return id;
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let text;
  try {
    text = await req.text();
  } catch {
    return json({ error: "bad request" }, 400);
  }
  if (text.length > MAX_BYTES) return json({ error: "too large" }, 413);

  let slides;
  try {
    slides = JSON.parse(text);
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (!Array.isArray(slides) || slides.length === 0 || slides.length > 200) {
    return json({ error: "invalid data" }, 400);
  }

  // เก็บเฉพาะ title / prompt ที่เป็นข้อความ
  const clean = slides.map((s) => ({
    title: String(s?.title ?? "").slice(0, 300),
    prompt: String(s?.prompt ?? ""),
  }));

  const store = getStore("copybox");
  const id = makeId();
  await store.setJSON(id, clean);
  return json({ id });
};

export const config = { path: "/api/save" };
