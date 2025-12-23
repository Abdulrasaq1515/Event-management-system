"use client"
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createNftService, type NftMetadata } from '@/lib/services/nft.service'

interface NFTGalleryProps {
  walletAddress: string
  onNFTSelect?: (nft: NftMetadata) => void
  selectedNFT?: NftMetadata | null
  className?: string
}

export const NFTGallery: React.FC<NFTGalleryProps> = ({
  walletAddress,
  onNFTSelect,
  selectedNFT,
  className = ''
}) => {
  const [nfts, setNfts] = useState<NftMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (walletAddress) {
      fetchNFTs()
    }
  }, [walletAddress])

  const fetchNFTs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Create a mock provider client for demonstration
      // In a real implementation, this would connect to Solana RPC or Metaplex
      const mockProviderClient = {
        listTokens: async (address: string) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Return mock NFT data for demonstration
          return [
            {
              tokenAddress: 'mock-token-1',
              mint: 'mock-mint-1',
              metadataUri: 'https://jsonplaceholder.typicode.com/posts/1'
            },
            {
              tokenAddress: 'mock-token-2', 
              mint: 'mock-mint-2',
              metadataUri: 'https://jsonplaceholder.typicode.com/posts/2'
            },
            {
              tokenAddress: 'mock-token-3',
              mint: 'mock-mint-3', 
              metadataUri: 'https://jsonplaceholder.typicode.com/posts/3'
            }
          ]
        }
      }

      // Mock fetch function that returns NFT-like metadata
      const mockFetch = async (url: string) => {
        const response = await fetch(url)
        const data = await response.json()
        
        // Transform the response to look like NFT metadata
        return {
          ok: true,
          json: async () => ({
            name: `NFT Collection #${data.id}`,
            description: data.body,
            image: `https://picsum.photos/400/400?random=${data.id}`,
            attributes: [
              { trait_type: 'Rarity', value: 'Common' },
              { trait_type: 'Collection', value: 'Demo Collection' }
            ]
          })
        }
      }

      const nftService = createNftService(mockProviderClient, mockFetch as any)
      const fetchedNFTs = await nftService.fetchNftsForWallet(walletAddress)
      
      setNfts(fetchedNFTs)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFTs'
      setError(errorMessage)
      console.error('NFT fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNFTClick = (nft: NftMetadata) => {
    onNFTSelect?.(nft)
  }

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span>Loading NFTs...</span>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">Failed to load NFTs</div>
          <div className="text-sm text-slate-400 mb-4">{error}</div>
          <Button variant="ghost" onClick={fetchNFTs}>
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="text-slate-400 mb-2">No NFTs Found</div>
          <div className="text-sm text-slate-500">
            This wallet doesn't contain any NFTs, or they couldn't be loaded.
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-slate-200">Select an NFT</h3>
        <p className="text-sm text-slate-400">
          Choose an NFT from your wallet to associate with this event
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft, index) => (
          <Card 
            key={nft.tokenAddress || index}
            className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
              selectedNFT?.tokenAddress === nft.tokenAddress 
                ? 'ring-2 ring-blue-500 bg-blue-900/20' 
                : ''
            }`}
            onClick={() => handleNFTClick(nft)}
          >
            {/* NFT Image */}
            <div className="aspect-square rounded-md overflow-hidden mb-3 bg-slate-800">
              {nft.image ? (
                <img 
                  src={nft.image} 
                  alt={nft.name || 'NFT'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x400/334155/94a3b8?text=NFT'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  No Image
                </div>
              )}
            </div>

            {/* NFT Info */}
            <div>
              <h4 className="font-medium text-slate-200 truncate">
                {nft.name || 'Unnamed NFT'}
              </h4>
              
              {nft.description && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {nft.description}
                </p>
              )}

              {/* Token Address */}
              <div className="mt-2 text-xs text-slate-500 font-mono">
                {nft.tokenAddress ? 
                  `${nft.tokenAddress.slice(0, 8)}...${nft.tokenAddress.slice(-8)}` :
                  'Unknown Address'
                }
              </div>

              {/* Selection Indicator */}
              {selectedNFT?.tokenAddress === nft.tokenAddress && (
                <div className="mt-2 flex items-center gap-1 text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-xs font-medium">Selected</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={fetchNFTs}>
          Refresh NFTs
        </Button>
      </div>
    </div>
  )
}

export default NFTGallery