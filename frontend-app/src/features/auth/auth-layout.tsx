interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='bg-background min-h-svh flex items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[480px] p-8 rounded-lg bg-card'>
        <div className='flex flex-col items-center justify-center'>
          <img 
            src="/images/barclays-wordmark.svg" 
            alt="Barclays" 
            className="h-8 mb-2" 
          />
          <h1 className='text-[#00aeef] text-xl font-bold mt-2'>Offers Hub</h1>
        </div>
        {children}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} OffersHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
