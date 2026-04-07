import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSession, validateSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

async function login(formData: FormData) {
  'use server'
  const password = formData.get('password') as string

  const expected = process.env.APP_PASSWORD ?? ''
  const passwordBuf = Buffer.from(password.padEnd(expected.length, '\0'))
  const expectedBuf = Buffer.from(expected.padEnd(password.length, '\0'))
  if (password.length !== expected.length || !timingSafeEqual(passwordBuf, expectedBuf)) {
    redirect('/login?error=1')
  }

  const token = await createSession()
  const cookieStore = await cookies()
  cookieStore.set('auth_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  redirect('/')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await searchParams

  // If already authenticated, redirect to dashboard
  const cookieStore = await cookies()
  const session = cookieStore.get('auth_session')
  if (session && await validateSession(session.value)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">teachIA</CardTitle>
          <CardDescription className="text-zinc-400">
            Préparation CAPES d&apos;espagnol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoFocus
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                placeholder="••••••••"
              />
            </div>
            {params.error && (
              <p className="text-sm text-red-400">Mot de passe incorrect.</p>
            )}
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
              Accéder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
