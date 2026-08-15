import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(): NextResponse {
  return NextResponse.json({
    status: 'ok',
    service: 'exclusive-app',
    version: '1.0.0',
    tier: 'exclusive',
    region: 'eu-west-1',
    timestamp: new Date().toISOString(),
  });
}
