import { describe, it, expect, vi } from 'vitest'
import { NftService } from './nft.service'

describe('NftService', () => {
  it('returns empty list when provider has no tokens', async () => {
    const provider = { listTokens: vi.fn(async () => []) }
    const service = new NftService(provider as any, vi.fn())
    const res = await service.fetchNftsForWallet('wallet1')
    expect(res).toEqual([])
  })

  it('fetches and parses metadata for tokens', async () => {
    const provider = { listTokens: vi.fn(async () => [{ tokenAddress: 't1', mint: 'm1', metadataUri: 'https://meta/1.json' }]) }
    const fetcher = vi.fn(async () => ({ ok: true, json: async () => ({ name: 'NFT #1', description: 'desc', image: 'ipfs://abc' }) }))
    const service = new NftService(provider as any, fetcher as any)
    const res = await service.fetchNftsForWallet('wallet1')
    expect(res.length).toBe(1)
    expect(res[0].name).toBe('NFT #1')
    expect(res[0].image).toBe('ipfs://abc')
    expect(res[0].tokenAddress).toBe('t1')
  })

  it('skips tokens with missing metadataUri', async () => {
    const provider = { listTokens: vi.fn(async () => [{ tokenAddress: 't1' }]) }
    const service = new NftService(provider as any, vi.fn())
    const res = await service.fetchNftsForWallet('wallet1')
    expect(res).toEqual([])
  })

  it('continues when a token metadata fetch fails', async () => {
    const provider = { listTokens: vi.fn(async () => [
      { tokenAddress: 't1', metadataUri: 'https://meta/1.json' },
      { tokenAddress: 't2', metadataUri: 'https://meta/2.json' },
    ]) }

    const fetcher = vi.fn()
    fetcher.mockImplementationOnce(async () => { throw new Error('network') })
    fetcher.mockImplementationOnce(async () => ({ ok: true, json: async () => ({ name: 'NFT #2' }) }))

    const service = new NftService(provider as any, fetcher as any)
    const res = await service.fetchNftsForWallet('wallet1')
    expect(res.length).toBe(1)
    expect(res[0].name).toBe('NFT #2')
    expect(res[0].tokenAddress).toBe('t2')
  })

  it('throws on invalid wallet address input', async () => {
    const provider = { listTokens: vi.fn(async () => []) }
    const service = new NftService(provider as any, vi.fn())
    await expect(service.fetchNftsForWallet('')).rejects.toThrow('Invalid wallet address')
  })
})
