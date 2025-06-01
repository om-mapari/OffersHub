import { createContext, useContext, useState, ReactNode } from 'react'
import { Offer } from '../data/schema'

interface OffersContextType {
  selectedOffer: Offer | null
  setSelectedOffer: (offer: Offer | null) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isViewDialogOpen: boolean
  setIsViewDialogOpen: (open: boolean) => void
  isApproveDialogOpen: boolean
  setIsApproveDialogOpen: (open: boolean) => void
  isRejectDialogOpen: boolean
  setIsRejectDialogOpen: (open: boolean) => void
}

const OffersContext = createContext<OffersContextType | undefined>(undefined)

export function useOffers() {
  const context = useContext(OffersContext)
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider')
  }
  return context
}

interface OffersProviderProps {
  children: ReactNode
}

export default function OffersProvider({ children }: OffersProviderProps) {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  
  // Selected offer
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  return (
    <OffersContext.Provider
      value={{
        selectedOffer,
        setSelectedOffer,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isViewDialogOpen,
        setIsViewDialogOpen,
        isApproveDialogOpen,
        setIsApproveDialogOpen,
        isRejectDialogOpen,
        setIsRejectDialogOpen,
      }}
    >
      {children}
    </OffersContext.Provider>
  )
} 