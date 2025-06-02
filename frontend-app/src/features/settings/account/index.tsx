import ContentSection from '../components/content-section'
import { AccountForm } from './account-form'
import { ChangePasswordForm } from './components/change-password-form'
import { Separator } from '@/components/ui/separator'

export default function SettingsAccount() {
  return (
    <div className="space-y-8">
      <ContentSection
        title='Account Details'
        desc='Update your account settings. Set your preferred language and
          timezone.'
      >
        <AccountForm />
      </ContentSection>
      
      <ChangePasswordForm />
    </div>
  )
}
