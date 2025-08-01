import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the entire request for debugging
    console.log("Notion webhook POST received:", JSON.stringify(body, null, 2));
    
    // Check if this is a verification request
    if (body.type === 'url_verification') {
      console.log("Verification token:", body.challenge);
      
      // Return the challenge to verify the webhook
      return NextResponse.json({ 
        challenge: body.challenge 
      });
    }
    
    // Handle other webhook events here
    console.log("Webhook event:", body.type);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Webhook POST error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challenge = searchParams.get('challenge');
    
    console.log("Notion webhook GET received");
    console.log("Challenge parameter:", challenge);
    
    if (challenge) {
      console.log("Verification token from GET:", challenge);
      // Return the challenge for verification
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    return NextResponse.json({ 
      message: "Notion webhook endpoint is active",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Webhook GET error:", error);
    return NextResponse.json(
      { error: "Webhook GET processing failed" },
      { status: 500 }
    );
  }
}