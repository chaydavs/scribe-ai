const PAYPAL_BASE_URL =
  process.env.PAYPAL_API_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com')

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getPayPalAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token
  }

  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data.access_token
}

export async function createPayPalOrder(
  amount: string,
  description: string,
  metadata: Record<string, string>
): Promise<{ id: string; approvalUrl: string }> {
  const token = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          description,
          custom_id: JSON.stringify(metadata),
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paypal/capture`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
        brand_name: 'ResumeLab',
        user_action: 'PAY_NOW',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal order creation failed: ${error}`)
  }

  const order = await response.json()
  const approvalUrl = order.links.find(
    (link: { rel: string; href: string }) => link.rel === 'approve'
  )?.href

  if (!approvalUrl) {
    throw new Error('No approval URL in PayPal response')
  }

  return { id: order.id, approvalUrl }
}

export async function capturePayPalOrder(
  orderId: string
): Promise<{ status: string; metadata: Record<string, string> }> {
  const token = await getPayPalAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal capture failed: ${error}`)
  }

  const data = await response.json()
  const customId = data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id

  let metadata: Record<string, string> = {}
  try {
    metadata = customId ? JSON.parse(customId) : {}
  } catch {
    // ignore parse errors
  }

  return { status: data.status, metadata }
}
