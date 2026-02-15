import ky from "ky"

const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL!

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
}

export async function GET(request: Request) {
  await ky.post(`${CORE_SERVICE_URL}/apps/cashflow/execute`, {
    headers: NO_CACHE_HEADERS,
  })

  return new Response("Cron executed successfully", {
    status: 200,
    headers: NO_CACHE_HEADERS,
  })
}
