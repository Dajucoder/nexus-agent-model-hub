import { NextResponse } from 'next/server';
import { leaderboardData } from '../../../lib/model-data';

export async function GET() {
  const data = leaderboardData();
  return NextResponse.json({
    ...data,
    updatedAt: new Date().toISOString()
  });
}
