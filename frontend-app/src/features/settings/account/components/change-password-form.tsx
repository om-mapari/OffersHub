import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, { message: 'Current password is required.' }),
    new_password: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters long.' })
      .regex(/[a-z]/, { message: 'New password must contain at least one lowercase letter.' })
      .regex(/[A-Z]/, { message: 'New password must contain at least one uppercase letter.' })
      .regex(/\d/, { message: 'New password must contain at least one number.' }),
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "New passwords don't match.",
    path: ['confirm_new_password'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const { changePassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  })

  async function onSubmit(data: ChangePasswordFormValues) {
    setIsLoading(true)
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully.')
      form.reset()
    } catch (error: any) {
      const errorMsg = error?.detail || 'Failed to change password. Please try again.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Update your password here. Make sure it's strong and memorable.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl><PasswordInput placeholder="Enter your current password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl><PasswordInput placeholder="Enter new password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl><PasswordInput placeholder="Confirm new password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Form>
    </div>
  )
} 