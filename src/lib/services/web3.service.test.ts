import { describe, it, expect, vi, beforeEach } from 'vitest';
import { web3Service } from './web3.service';

describe('Web3Service', () => {
  beforeEach(() => {
    // Reset provider between tests
    (web3Service as any).provider = null;
  });

  it('connect should throw when no provider set', async () => {
    await expect(web3Service.connect()).rejects.toThrow('No wallet provider set');
  });

  it('connect should return public key when provider connects', async () => {
    const provider = {
      connect: vi.fn(async () => ({ publicKey: { toString: () => 'pk1' } })),
    } as any;

    web3Service.setProvider(provider);

    const pk = await web3Service.connect();
    expect(pk).toBe('pk1');
    expect(provider.connect).toHaveBeenCalled();
  });

  it('getPublicKey should return provider publicKey', () => {
    const provider = { publicKey: { toString: () => 'pk2' } } as any;
    web3Service.setProvider(provider);
    expect(web3Service.getPublicKey()).toBe('pk2');
  });

  it('disconnect should call provider.disconnect if available', async () => {
    const provider = { disconnect: vi.fn(async () => {}) } as any;
    web3Service.setProvider(provider);
    await web3Service.disconnect();
    expect(provider.disconnect).toHaveBeenCalled();
  });

  it('verifyOwnership should use signMessage when available', async () => {
    const provider = {
      signMessage: vi.fn(async () => ({ signature: new Uint8Array([1, 2, 3]) })),
    } as any;
    web3Service.setProvider(provider);

    const ok = await web3Service.verifyOwnership(new Uint8Array([9]), new Uint8Array([1,2,3]), 'pk');
    expect(ok).toBe(true);
    expect(provider.signMessage).toHaveBeenCalled();
  });

  it('verifyOwnership should verify Solana signatures', async () => {
    const message = new Uint8Array([1,2,3,4,5])
    // Generate a nacl keypair and sign
    const kp = (await import('tweetnacl')).sign.keyPair()
    const signature = (await import('tweetnacl')).sign.detached(message, kp.secretKey)
    const { PublicKey } = await import('@solana/web3.js')
    const pkStr = new PublicKey(kp.publicKey).toString()

    // No provider needed — verify using Solana logic
    const ok = await web3Service.verifyOwnership(message, signature, pkStr)
    expect(ok).toBe(true)

    // Tampered signature fails
    const bad = new Uint8Array(signature)
    bad[0] = (bad[0] + 1) & 255
    const ok2 = await web3Service.verifyOwnership(message, bad, pkStr)
    expect(ok2).toBe(false)
  })
});
