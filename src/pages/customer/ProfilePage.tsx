import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { authApi } from '@/api/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const schema = z.object({
  name:  z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const { user, setTokens, accessToken, refreshToken } = useAuthStore()
  const { toast } = useUiStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone ?? '' })
  }, [user, reset])

  async function onSubmit(data: FormData) {
    try {
      const updated = await authApi.updateProfile({
        name: data.name,
        phone: data.phone || undefined,
      })
      // Re-hydrate store with updated user
      setTokens(accessToken!, refreshToken!, updated)
      toast.success('Profile updated successfully')
      reset({ name: updated.name, phone: updated.phone ?? '' })
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-text mb-8">My Profile</h1>

      {/* Avatar + info */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full bg-cyan-dim border border-cyan-border flex items-center justify-center shrink-0">
            <span className="font-display text-2xl font-bold text-cyan">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-display font-semibold text-text text-lg">{user?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-text-dim text-sm">
              <Mail className="size-3.5" />
              {user?.email}
            </div>
            {user?.phone && (
              <div className="flex items-center gap-1.5 mt-0.5 text-text-dim text-sm">
                <Phone className="size-3.5" />
                {user.phone}
              </div>
            )}
            <div className="mt-2">
              <Badge variant={user?.role === 'ADMIN' ? 'info' : 'default'}>
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="size-4 text-text-dim" />
          <h2 className="font-display font-semibold text-text">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Email is read-only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-muted font-medium">Email</label>
            <input
              value={user?.email ?? ''}
              readOnly
              className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-text-dim text-sm cursor-not-allowed outline-none"
            />
            <p className="text-xs text-text-dim">Email cannot be changed</p>
          </div>

          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!isDirty}
            className="mt-2"
          >
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  )
}
