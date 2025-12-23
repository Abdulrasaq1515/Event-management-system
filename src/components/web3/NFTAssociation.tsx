"use client"
import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WalletConnection } from './WalletConnection'
import { WalletStatus } from './WalletStatus'
import { NFTGallery } from './NFTGallery'
import type { NftMetadata } from '@/lib/services/nft.service'

interface NFTAssociationProps {
  eventId: string
  currentNFT?: NftMetadata | null
  onNFTAssociate?: (nft: NftMetadata) => Promise<void>
  onNFTRemove?: () => Promise<void>
  className?: string
}

export const NFTAssociation: React.FC<NFTAssociationProps> = ({
  eventId,
  currentNFT,
  onNFTAssociate,
  onNFTRemove,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [selectedNFT, setSelectedNFT] = useState<NftMetadata | null>(currentNFT || null)
  const [isAssociating, setIsAssociating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleConnectionChange = (connected: boolean, address?: string) => {
    setIsConnected(connected)
    setWalletAddress(address || '')
    
    if (!connected) {
      setSelectedNFT(null)
    }
  }

  const handleNFTSelect = (nft: NftMetadata) => {
    setSelectedNFT(nft)
  }

  const handleAssociate = async () => {
    if (!selectedNFT || !onNFTAssociate) return

    setIsAssociating(true)
    try {
      await onNFTAssociate(selectedNFT)
    } catch (error) {
      console.error('Failed to associate NFT:', error)
    } finally {
      setIsAssociating(false)
    }
  }

  const handleRemove = async () => {
    if (!onNFTRemove) return

    setIsRemoving(true)
    try {
      await onNFTRemove()
      setSelectedNFT(null)
    } catch (error) {
      console.error('Failed to remove NFT:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">
            NFT Association
          </h2>
          <p className="text-slate-400">
            Connect your wallet and associate an NFT with this event for blockchain-based ticketing.
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-200 mb-3">
            1. Connect Wallet
          </h3>
          
          <WalletConnection 
            onConnectionChange={handleConnectionChange}
            className="mb-4"
          />
          
          <WalletStatus 
            isConnected={isConnected}
            address={walletAddress}
          />
        </div>

        {/* Current NFT Association */}
        {currentNFT && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-200 mb-3">
              Current NFT Association
            </h3>
            
            <Card className="p-4 bg-green-900/20 border-green-700">
              <div className="flex items-center gap-4">
                {currentNFT.image && (
                  <img 
                    src={currentNFT.image}
                    alt={currentNFT.name || 'Associated NFT'}
                    className="w-16 h-16 rounded-md object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/64x64/334155/94a3b8?text=NFT'
                    }}
                  />
                )}
                
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200">
                    {currentNFT.name || 'Unnamed NFT'}
                  </h4>
                  {currentNFT.description && (
                    <p className="text-sm text-slate-400 mt-1">
                      {currentNFT.description}
                    </p>
                  )}
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    {currentNFT.tokenAddress ? 
                      `${currentNFT.tokenAddress.slice(0, 8)}...${currentNFT.tokenAddress.slice(-8)}` :
                      'Unknown Address'
                    }
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="text-red-400 hover:text-red-300"
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* NFT Selection */}
        {isConnected && walletAddress && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-200 mb-3">
              2. Select NFT
            </h3>
            
            <NFTGallery 
              walletAddress={walletAddress}
              onNFTSelect={handleNFTSelect}
              selectedNFT={selectedNFT}
            />
          </div>
        )}

        {/* Association Actions */}
        {selectedNFT && selectedNFT.tokenAddress !== currentNFT?.tokenAddress && (
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-200">
                  Ready to Associate
                </h4>
                <p className="text-sm text-slate-400">
                  Associate "{selectedNFT.name || 'Unnamed NFT'}" with this event
                </p>
              </div>
              
              <Button 
                variant="primary" 
                onClick={handleAssociate}
                disabled={isAssociating}
              >
                {isAssociating ? 'Associating...' : 'Associate NFT'}
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!isConnected && (
          <div className="mt-6 p-4 bg-slate-800/50 rounded-md">
            <h4 className="font-medium text-slate-200 mb-2">
              About NFT Association
            </h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Connect your Solana wallet to view your NFTs</li>
              <li>• Select an NFT to associate with this event</li>
              <li>• NFT holders can use their tokens for event access</li>
              <li>• This creates a blockchain-based ticketing system</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}

export default NFTAssociation