import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { verifyPassword } from "./password";
import { ErrorCode } from "./errors";

type DbCtx = QueryCtx | MutationCtx;

export async function getListBySlug(
  ctx: DbCtx,
  slug: string,
): Promise<Doc<"lists"> | null> {
  return await ctx.db
    .query("lists")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function listPasswordOk(
  list: Doc<"lists">,
  password: string | undefined,
): Promise<boolean> {
  if (!list.passwordHash || !list.passwordSalt) {
    return true;
  }
  if (!password) {
    return false;
  }
  return await verifyPassword(password, list.passwordSalt, list.passwordHash);
}

export async function requireListAccess(
  ctx: DbCtx,
  slug: string,
  password: string | undefined,
): Promise<Doc<"lists">> {
  const list = await getListBySlug(ctx, slug);
  if (!list) {
    throw new Error(ErrorCode.LIST_NOT_FOUND);
  }
  const allowed = await listPasswordOk(list, password);
  if (!allowed) {
    throw new Error(ErrorCode.INVALID_PASSWORD);
  }
  return list;
}

export function generateSlug(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let slug = "";
  for (const byte of bytes) {
    const char = alphabet[byte % alphabet.length];
    slug += char ?? "x";
  }
  return slug;
}
