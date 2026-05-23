import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'

const schema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.email('Enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const { toast } = useUiStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      })
      toast.success('Account created! Welcome to TechsStore.')
      navigate(ROUTES.home, { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.'
      setError('root', { message: msg })
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="size-12 bg-cyan-dim rounded-xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="size-5 text-cyan" />
        </div>
        <h1 className="font-display text-2xl font-bold text-text">Create account</h1>
        <p className="text-text-dim text-sm mt-1">Join TechsStore today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        {errors.root && (
          <p className="text-sm text-coral bg-coral-dim border border-coral/20 rounded px-3 py-2">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-text-dim mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="text-cyan hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
