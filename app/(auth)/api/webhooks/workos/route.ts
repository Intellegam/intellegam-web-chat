import serverEnv from '@/lib/env.server';
import { processWebhookEvent } from '@/lib/workos/webhook-handlers';
import { WorkOS } from '@workos-inc/node';
import { type NextRequest, NextResponse } from 'next/server';

const workos = new WorkOS(serverEnv.WORKOS_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('workos-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    if (serverEnv.WORKOS_WEBHOOK_SECRET) {
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
    } else {
      return NextResponse.json(
        { error: 'Webhook secret required' },
        { status: 500 },
      );
    }

    const event = JSON.parse(body);
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
