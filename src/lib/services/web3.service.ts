/**
 * Lightweight Web3Service abstraction for wallet interactions.
 * Designed to be provider-agnostic (Solana, web3 providers, etc.).
 */
export type WalletProvider = {
  connect?: () => Promise<{ publicKey: { toString: () => string } } | void>;
  disconnect?: () => Promise<void>;
  publicKey?: { toString: () => string } | null;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
};

import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'

export class Web3Service {
  private provider: WalletProvider | null = null;

  setProvider(provider: WalletProvider) {
    this.provider = provider;
  }

  async connect(): Promise<string | null> {
    if (!this.provider) {
      throw new Error('No wallet provider set');
    }

    if (this.provider.connect) {
      const result = await this.provider.connect();
      if (result && result.publicKey) return result.publicKey.toString();
    }

    if (this.provider.publicKey) {
      return this.provider.publicKey.toString();
    }

    return null;
  }

  async disconnect(): Promise<void> {
    if (!this.provider) return;
    if (this.provider.disconnect) await this.provider.disconnect();
  }

  getPublicKey(): string | null {
    if (!this.provider) return null;
    return this.provider.publicKey ? this.provider.publicKey.toString() : null;
  }

  async verifyOwnership(message: Uint8Array, signature: Uint8Array, publicKeyStr: string): Promise<boolean> {
    // Chain-aware verification:
    // - If the public key parses as a Solana public key, use nacl to verify
    // - Otherwise, if the provider can sign messages, ask it to sign and compare
    if (!publicKeyStr || !signature || !message) return false

    // Try Solana verification first (base58 public key)
    try {
      const pk = new PublicKey(publicKeyStr)
      const pkBytes = pk.toBytes()
      // nacl expects message, signature, publicKey
      return nacl.sign.detached.verify(message, signature, pkBytes)
    } catch (err) {
      // not a valid Solana public key — fall through
    }

    // If the provider can sign messages, use it as an oracle: ask it to sign
    // the same message and compare bytes.
    if (this.provider && this.provider.signMessage) {
      try {
        const signed = await this.provider.signMessage(message)
        if (!signed || !signed.signature) return false
        // Compare signatures byte-wise
        if (signed.signature.length !== signature.length) return false
        for (let i = 0; i < signature.length; i++) if (signed.signature[i] !== signature[i]) return false
        return true
      } catch (err) {
        return false
      }
    }

    return false
  }
}

export const web3Service = new Web3Service();
