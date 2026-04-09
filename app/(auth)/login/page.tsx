import { redirect } from 'next/navigation'
import { auth, signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white border-slate-200 shadow-sm">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-violet-600" />
          </div>
          <CardTitle className="text-slate-900">teachIA</CardTitle>
          <CardDescription className="text-slate-500">
            Préparation CAPES d&apos;espagnol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/' })
            }}
          >
            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              Continuer avec Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
