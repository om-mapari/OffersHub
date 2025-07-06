import * as React from 'react'
import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { IconBrandWindows, IconWand } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  username: z // Changed from email to username as per OAuth2 standard for 'password' grant
    .string()
    .min(1, { message: 'Please enter your username or intranet id' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .max(100, {
      message: 'Password is too long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(auth.loading) // Reflect auth loading state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // Function to fill form with test credentials
  const fillTestCredentials = () => {
    form.setValue('username', 'coderom')
    form.setValue('password', 'coderom')
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // For 'password' grant type, typically username is used.
      // If your API expects email, ensure 'username' field in form corresponds to that.
      await auth.login({ username: data.username, password: data.password, grant_type: 'password' })
      toast.success('Login successful!', { duration: 4000 })
      
      // Get the redirect path from the URL query parameters or default to '/'
      const searchParams = new URLSearchParams(window.location.search)
      let redirectPath = searchParams.get('redirect') || '/'
      
      // Fix the [object Object] issue by ensuring redirectPath is a string
      if (redirectPath.includes('[object Object]')) {
        redirectPath = '/'
      }
      
      // Navigate to the dashboard or the specified redirect path
      navigate({ to: redirectPath, replace: true })
    } catch (error: any) {
      const errorMsg = error?.detail?.[0]?.msg || error?.detail || 'Login failed. Please check your credentials.'
      toast.error(errorMsg, { duration: 4000 })
    } finally {
      setIsLoading(false)
    }
  }

  // Update isLoading based on auth context's loading state
  React.useEffect(() => setIsLoading(auth.loading), [auth.loading])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-6', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username Or Intranet ID</FormLabel>
              <FormControl>
                <Input placeholder='name@barclays.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type='submit' 
          className='w-full bg-primary text-white hover:bg-primary/90' 
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full border-blue-500 text-blue-500 hover:bg-blue-500/10 flex items-center justify-center"
          onClick={fillTestCredentials}
        >
          {IconWand ? <IconWand className="mr-2 h-4 w-4" /> : <span className="mr-2">✨</span>}
          Auto-fill with Test Credentials
        </Button>
        
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>
        <Button 
          variant='outline' 
          type='button' 
          className='w-full border-primary text-primary hover:bg-primary/10'
        >
          <IconBrandWindows className='mr-2 size-5' />
          Sign in with Microsoft
        </Button>
      </form>
    </Form>
  )
}
