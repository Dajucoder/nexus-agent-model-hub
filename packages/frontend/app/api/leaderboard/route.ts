import { NextResponse } from 'next/server';
import { getLeaderboardBundle } from '../../../lib/leaderboard-data';

export async function GET() {
  return NextResponse.json(getLeaderboardBundle());
}
