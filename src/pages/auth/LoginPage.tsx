import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, { message: 'Password is required' }),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuthStore()
  const { toast } = useUiStore()

  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.home

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password'
      setError('root', { message: msg })
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="size-12 bg-cyan-dim rounded-xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="size-5 text-cyan" />
        </div>
        <h1 className="font-display text-2xl font-bold text-text">Welcome back</h1>
        <p className="text-text-dim text-sm mt-1">Sign in to your TechsStore account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {errors.root && (
          <p className="text-sm text-coral bg-coral-dim border border-coral/20 rounded px-3 py-2">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-text-dim mt-6">
        Don't have an account?{' '}
        <Link to={ROUTES.register} className="text-cyan hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
