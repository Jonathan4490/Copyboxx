import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!/^[a-z0-9]{6,20}$/.test(id)) return json({ error: "bad id" }, 400);

  const store = getStore("copybox");
  const data = await store.get(id, { type: "json" });
  if (!data) return json({ error: "not found" }, 404);
  return json(data);
};

export const config = { path: "/api/get" };
