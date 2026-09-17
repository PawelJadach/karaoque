import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { SongStatus } from "./validators";

export function resolveSongStatus(song: {
  status?: SongStatus;
  done?: boolean;
}): SongStatus {
  if (song.status) {
    return song.status;
  }
  return song.done ? "done" : "todo";
}

export async function patchSongStatus(
  ctx: MutationCtx,
  songId: Id<"songs">,
  status: SongStatus,
): Promise<void> {
  await ctx.db.patch("songs", songId, {
    status,
    done: status === "done",
  });
}

export async function applySongStatus(
  ctx: MutationCtx,
  listId: Id<"lists">,
  song: Doc<"songs">,
  status: SongStatus,
  limit: number,
): Promise<void> {
  const current = resolveSongStatus(song);
  if (current === status) {
    return;
  }

  const songs = await ctx.db
    .query("songs")
    .withIndex("by_list", (q) => q.eq("listId", listId))
    .take(limit);

  if (status === "now") {
    for (const other of songs) {
      if (other._id !== song._id && resolveSongStatus(other) === "now") {
        await patchSongStatus(ctx, other._id, "done");
      }
    }
  }

  if (status === "next") {
    for (const other of songs) {
      if (other._id !== song._id && resolveSongStatus(other) === "next") {
        await patchSongStatus(ctx, other._id, "todo");
      }
    }
  }

  await patchSongStatus(ctx, song._id, status);

  if (status === "done" && current === "now") {
    const nextSong = songs.find(
      (other) => other._id !== song._id && resolveSongStatus(other) === "next",
    );
    if (nextSong) {
      await patchSongStatus(ctx, nextSong._id, "now");
    }
  }
}
