import { type NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { processWebhookEvent } from '@/lib/workos/webhook-handlers';
import serverEnv from '@/lib/env.server';

const workos = new WorkOS(serverEnv.WORKOS_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('workos-signature');

    // Verify webhook signature (skip in development if no secret)
    if (serverEnv.WORKOS_WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 },
        );
      }

      const isValid = workos.webhooks.constructEvent({
        payload: body,
        sigHeader: signature,
        secret: serverEnv.WORKOS_WEBHOOK_SECRET,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 },
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Webhook secret required in production' },
        { status: 500 },
      );
    }

    const event = JSON.parse(body);

    // Process event using modular handlers
    const result = await processWebhookEvent(event);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      eventId: event.id,
      eventType: event.event,
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
