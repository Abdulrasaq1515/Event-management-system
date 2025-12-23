/**
 * Lightweight NFT fetching and metadata parsing service.
 *
 * This is provider-agnostic: a small `providerClient` with `listTokens(address)` is injected
 * which should return an array of token entries containing at least `metadataUri` when available.
 * The service will fetch each metadata URI (using the injected `fetcher`) and normalize the result.
 */

export type NftTokenEntry = {
  tokenAddress?: string
  mint?: string
  metadataUri?: string
}

export type NftMetadata = {
  name?: string | null
  description?: string | null
  image?: string | null
  tokenAddress?: string | null
  mint?: string | null
  metadataUri?: string | null
  raw?: any
}

export class NftService {
  constructor(
    private providerClient: { listTokens: (address: string) => Promise<NftTokenEntry[]> },
    private fetcher: typeof fetch = (globalThis as any).fetch,
  ) {}

  async fetchNftsForWallet(address: string): Promise<NftMetadata[]> {
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid wallet address')
    }

    const tokens = await this.providerClient.listTokens(address)
    const out: NftMetadata[] = []

    for (const t of tokens || []) {
      if (!t?.metadataUri) continue

      try {
        const res = await this.fetcher(t.metadataUri)
        if (!res || (typeof (res as any).ok === 'boolean' && !(res as any).ok)) continue
        const json = await res.json()
        out.push({
          name: json?.name ?? null,
          description: json?.description ?? null,
          image: json?.image ?? json?.image_url ?? null,
          tokenAddress: t.tokenAddress ?? null,
          mint: t.mint ?? null,
          metadataUri: t.metadataUri ?? null,
          raw: json,
        })
      } catch (err) {
        // Skip failed token fetches and continue
        continue
      }
    }

    return out
  }
}

export const createNftService = (providerClient: { listTokens: (address: string) => Promise<NftTokenEntry[]> }, fetcher?: typeof fetch) =>
  new NftService(providerClient, fetcher)

export default NftService
