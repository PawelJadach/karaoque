import { proxyClerkFrontendApi } from "../../../lib/clerkFapiProxy";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return proxyClerkFrontendApi(request);
}

export async function POST(request: Request) {
  return proxyClerkFrontendApi(request);
}

export async function PUT(request: Request) {
  return proxyClerkFrontendApi(request);
}

export async function PATCH(request: Request) {
  return proxyClerkFrontendApi(request);
}

export async function DELETE(request: Request) {
  return proxyClerkFrontendApi(request);
}

export async function OPTIONS(request: Request) {
  return proxyClerkFrontendApi(request);
}
