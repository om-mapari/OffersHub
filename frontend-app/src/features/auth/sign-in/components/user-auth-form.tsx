import * as React from 'react'
import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react'
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
    .min(1, { message: 'Please enter your username or email' }),
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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // For 'password' grant type, typically username is used.
      // If your API expects email, ensure 'username' field in form corresponds to that.
      await auth.login({ username: data.username, password: data.password, grant_type: 'password' })
      toast.success('Login successful!')
      
      // Get the redirect path from the URL query parameters or default to '/'
      const searchParams = new URLSearchParams(window.location.search)
      let redirectPath = searchParams.get('redirect') || '/'
      
      // Fix the [object Object] issue by ensuring redirectPath is a string
      if (redirectPath.includes('[object Object]')) {
        redirectPath = '/'
      }
      
      navigate({ to: redirectPath, replace: true })
    } catch (error: any) {
      const errorMsg = error?.detail?.[0]?.msg || error?.detail || 'Login failed. Please check your credentials.'
      toast.error(errorMsg)
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
              <FormLabel>Username or Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
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
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
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
        <div className='grid grid-cols-2 gap-4'>
          <Button variant='outline' type='button'>
            <IconBrandGithub className='mr-2 size-4' />
            Github
          </Button>
          <Button variant='outline' type='button'>
            <IconBrandFacebook className='mr-2 size-4' />
            Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
