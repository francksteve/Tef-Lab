const BASE_URL =
  process.env.PAYPAL_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? ''
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`[PayPal] Token error: ${err}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function createPayPalOrder(params: {
  amountUsd: string
  internalRef: string
  description: string
  returnUrl: string
  cancelUrl: string
}): Promise<{ orderId: string; approvalUrl: string }> {
  const accessToken = await getAccessToken()

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.internalRef,
          custom_id: params.internalRef,
          description: params.description,
          amount: {
            currency_code: 'USD',
            value: params.amountUsd,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'TEF-LAB',
            landing_page: 'LOGIN',
            user_action: 'PAY_NOW',
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`[PayPal] Create order error: ${err}`)
  }

  const data = await res.json()
  const approvalUrl: string =
    data.links?.find((l: { rel: string }) => l.rel === 'payer-action')?.href ??
    data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href ??
    ''

  return { orderId: data.id as string, approvalUrl }
}

export async function capturePayPalOrder(
  paypalOrderId: string
): Promise<{ status: string; captureId: string }> {
  const accessToken = await getAccessToken()

  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`[PayPal] Capture error: ${err}`)
  }

  const data = await res.json()
  const captureId: string =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? ''

  return { status: data.status as string, captureId }
}
