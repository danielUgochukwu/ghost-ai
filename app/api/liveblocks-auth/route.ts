import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getLiveblocksClient, getCursorColor } from "@/lib/liveblocks";
import { getProjectAccess } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const room = body?.room;

  if (!room || typeof room !== "string") {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }

  const access = await getProjectAccess(room);
  if (!access.hasAccess || !access.identity) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const name =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Unknown";
  const avatar = user?.imageUrl ?? "";
  const cursorColor = getCursorColor(access.identity.userId);

  const liveblocks = getLiveblocksClient();
  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  const session = liveblocks.prepareSession(access.identity.userId, {
    userInfo: { name, avatar, cursorColor },
  });
  session.allow(room, ["room:write"]);

  const { status, body: responseBody } = await session.authorize();
  return new NextResponse(responseBody, { status });
}
