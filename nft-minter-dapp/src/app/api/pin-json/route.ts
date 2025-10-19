import { NextResponse, NextRequest } from 'next/server'
import { pinata } from '@/utils/config'

export async function POST(req: NextRequest) {
  try {
    const metadata = await req.json()

    if (!process.env.PINATA_JWT || process.env.PINATA_JWT.trim().length === 0) {
      return NextResponse.json(
        { error: 'Server misconfigured: PINATA_JWT is missing' },
        { status: 500 }
      )
    }

    let cid: string
    try {
      const upload = await pinata.upload.public.json(metadata)
      cid = upload.cid
    } catch (sdkErr) {
      console.error('Pinata SDK JSON upload failed, falling back to pinJSONToIPFS:', sdkErr)

      const payload = JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: 'metadata.json' },
      })

      const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: payload,
      })

      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json(
          { error: 'Pinata JSON pin failed', details: errText },
          { status: res.status }
        )
      }
      const body = await res.json()
      cid = body?.IpfsHash || body?.cid || body?.data?.cid
      if (!cid) {
        return NextResponse.json(
          { error: 'Pinata JSON response missing IpfsHash/CID', raw: body },
          { status: 502 }
        )
      }
    }

    let gatewayUrl: string | null = null
    try {
      gatewayUrl = await pinata.gateways.public.convert(cid)
    } catch (e) {
      console.warn('Pinata gateway convert failed:', e)
    }

    return NextResponse.json({ IpfsHash: cid, gatewayUrl })
  } catch (error) {
    console.error('Error pinning JSON:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to pin JSON', details: message },
      { status: 500 }
    )
  }
}