"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { web3Service } from '@/lib/services/web3.service'

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean, address?: string) => void
  className?: string
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnectionChange,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = () => {
    const address = web3Service.getPublicKey()
    if (address) {
      setIsConnected(true)
      setWalletAddress(address)
      onConnectionChange?.(true, address)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if wallet is available (Phantom, Solflare, etc.)
      if (typeof window !== 'undefined' && (window as any).solana) {
        const provider = (window as any).solana
        web3Service.setProvider(provider)
        
        const address = await web3Service.connect()
        
        if (address) {
          setIsConnected(true)
          setWalletAddress(address)
          onConnectionChange?.(true, address)
        } else {
          throw new Error('Failed to get wallet address')
        }
      } else {
        throw new Error('Solana wallet not found. Please install Phantom or another Solana wallet.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(errorMessage)
      console.error('Wallet connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await web3Service.disconnect()
      setIsConnected(false)
      setWalletAddress(null)
      setError(null)
      onConnectionChange?.(false)
    } catch (err) {
      console.error('Wallet disconnection error:', err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (isConnected && walletAddress) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-md">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-mono text-slate-200">
            {formatAddress(walletAddress)}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <Button 
        variant="primary" 
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      {error && (
        <div className="mt-2 p-3 bg-red-900/20 border border-red-700 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
          {error.includes('wallet not found') && (
            <div className="mt-2">
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Install Phantom Wallet
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WalletConnection