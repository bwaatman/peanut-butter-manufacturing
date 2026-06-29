// import { supabase } from './supabase'
import type { UserRole } from '../types/database'

// TEMPORARY SIMPLIFIED AUTHENTICATION
// Commented out Supabase auth for simple username/password login
// To restore Supabase auth, uncomment the functions below and remove the simple auth functions

/*
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
*/

// Simple authentication for internal testing
export async function signIn(username: string, password: string) {
  const validUsername = import.meta.env.VITE_LOGIN_USERNAME
  const validPassword = import.meta.env.VITE_LOGIN_PASSWORD

  if (username === validUsername && password === validPassword) {
    return { data: { user: { username } }, error: null }
  }
  return { data: null, error: { message: 'Invalid username or password' } }
}

export async function signOut() {
  // Simple sign out - just clear session
  return { error: null }
}

export async function getCurrentUser() {
  // Check localStorage for simple auth session
  const session = localStorage.getItem('auth_session')
  if (session) {
    return { user: JSON.parse(session), error: null }
  }
  return { user: null, error: null }
}

export async function onAuthStateChange(_callback: (event: string, session: any) => void) {
  // Simple mock for compatibility - not used in simple auth
  return { data: { subscription: { unsubscribe: () => {} } } }
}

export async function getUserRole(): Promise<UserRole | null> {
  // TEMPORARY: Return admin role for all authenticated users
  // To restore role-based access, uncomment the original implementation below
  return 'admin'

  /*
  // In a real implementation, you would fetch the user's role from a custom table
  // For now, we'll use a simple approach based on email patterns
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) return null
  
  const email = user.email
  
  // Simple role assignment based on email (for demo purposes)
  // In production, this should be stored in a user_roles table
  if (email?.includes('admin')) return 'admin'
  if (email?.includes('analyst')) return 'analyst'
  return 'production_staff'
  */
}
