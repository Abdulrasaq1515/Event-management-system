import fc from 'fast-check'
import nacl from 'tweetnacl'
import { describe, it, expect } from 'vitest'
import { web3Service } from './web3.service'

describe('Web3Service property tests', () => {
  it('Solana signature verification holds for arbitrary messages', { timeout: 10000 }, async () => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array(), async (msg) => {
        // generate keypair and sign
        const kp = nacl.sign.keyPair()
        const sig = nacl.sign.detached(msg, kp.secretKey)

        const { PublicKey } = await import('@solana/web3.js')
        const pkStr = new PublicKey(kp.publicKey).toString()
        const ok = await web3Service.verifyOwnership(msg, sig, pkStr)
        if (!ok) throw new Error('Verification failed for valid signature')
        return true
      }),
    )
  })

  it('provider fallback verifies when provider signs same message', { timeout: 10000 }, async () => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array(), async (msg) => {
        // provider that returns a deterministic signature of the message
        const provider = {
          signMessage: async (m: Uint8Array) => ({ signature: new Uint8Array(m) }),
        } as any
        web3Service.setProvider(provider)

        const sig = new Uint8Array(msg)
        const ok = await web3Service.verifyOwnership(msg, sig, 'some-pk')
        if (!ok) throw new Error('Provider fallback verification failed')
        return true
      }),
    )
  })
})
