import { createFileRoute } from '@tanstack/react-router'
import Offers from '@/features/offers'

export const Route = createFileRoute('/_authenticated/offers/')({
  component: Offers,
}) 