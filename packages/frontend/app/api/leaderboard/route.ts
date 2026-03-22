import { NextResponse } from "next/server";
import { getLeaderboardBundle } from "../../../lib/leaderboard-data";

export const revalidate = 3600;

export async function GET() {
  const bundle = await getLeaderboardBundle();
  return NextResponse.json(bundle);
}
