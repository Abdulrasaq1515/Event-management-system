"use client"
import React from 'react'
import { Card } from '@/components/ui/Card'

interface WalletStatusProps {
  isConnected: boolean
  address?: string
  className?: string
}

export const WalletStatus: React.FC<WalletStatusProps> = ({
  isConnected,
  address,
  className = ''
}) => {
  if (!isConnected) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div>
            <div className="font-medium text-slate-200">Wallet Disconnected</div>
            <div className="text-sm text-slate-400">Connect your wallet to access Web3 features</div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        <div>
          <div className="font-medium text-slate-200">Wallet Connected</div>
          <div className="text-sm text-slate-400 font-mono">
            {address ? `${address.slice(0, 8)}...${address.slice(-8)}` : 'Unknown address'}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default WalletStatus