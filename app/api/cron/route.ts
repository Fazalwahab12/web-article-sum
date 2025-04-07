import { NextResponse } from "next/server";
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Log the attempt
    console.log('Cron job triggered at:', new Date().toISOString());

    // Verify Vercel cron authentication
    const headersList = headers();
    const cronSecret = (await headersList).get('x-vercel-cron');
    
    if (!cronSecret) {
      console.log('Missing cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call your update-articles endpoint
    const response = await fetch(`${process.env.VERCEL_URL}/api/update-articles`, {
      method: 'GET',
    });

    const result = await response.json();
    
    // Log the result
    console.log('Cron job completed:', result);

    return NextResponse.json({
      success: true,
      executed: new Date().toISOString(),
      result
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}