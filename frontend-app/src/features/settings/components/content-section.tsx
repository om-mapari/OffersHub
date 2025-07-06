import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ContentSectionProps {
  title: string
  desc: string
  children: React.JSX.Element
}

export default function ContentSection({
  title,
  desc,
  children,
}: ContentSectionProps) {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>{title}</h3>
        <p className='text-muted-foreground text-sm'>{desc}</p>
      </div>
      <Separator className='my-4 flex-none' />
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className='w-full pr-4 pb-12'>
          <div className='-mx-1 px-1.5 lg:max-w-xl'>{children}</div>
        </div>
      </ScrollArea>
    </div>
  )
}
