import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import PostgresAdapter from '@auth/pg-adapter'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Block blocked users
      if (!user?.id) return true
      try {
        const result = await pool.query(
          'SELECT blocked FROM users WHERE id = $1',
          [user.id]
        )
        if (result.rows[0]?.blocked === true) return false
      } catch {
        // User may not exist yet (first sign-in), allow through
      }
      return true
    },
    async session({ session, user }) {
      // Attach id and role to session
      session.user.id = user.id
      const result = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [user.id]
      )
      const role = result.rows[0]?.role ?? 'student'
      // Promote to superadmin if email matches env var
      if (
        process.env.SUPERADMIN_EMAIL &&
        session.user.email === process.env.SUPERADMIN_EMAIL &&
        role !== 'superadmin'
      ) {
        await pool.query(
          "UPDATE users SET role = 'superadmin' WHERE id = $1",
          [user.id]
        )
        session.user.role = 'superadmin'
      } else {
        session.user.role = role
      }
      return session
    },
  },
})

// TypeScript augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'student' | 'superadmin'
    } & import('next-auth').DefaultSession['user']
  }
}
