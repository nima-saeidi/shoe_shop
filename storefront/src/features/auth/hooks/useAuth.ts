import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore, useIsAuthenticated } from '@/app/store/authStore'
import { cartKeys } from '@/features/cart/hooks/useCart'
import { authService } from '../services/authService'
import type { LoginInput, RegisterInput } from '../types'

export const authKeys = {
  me: ['me'] as const,
}

/** The signed-in customer, fresh from the API (SessionBootstrap mirrors it into the auth store). */
export function useMe() {
  const enabled = useIsAuthenticated()
  return useQuery({ queryKey: authKeys.me, queryFn: authService.me, enabled })
}

/** Stores the tokens, then loads the profile; any failure leaves the visitor signed out. */
async function signIn(input: LoginInput) {
  const { setTokens, setUser } = useAuthStore.getState()
  const tokens = await authService.login(input)
  setTokens(tokens.access_token, tokens.refresh_token)
  const user = await authService.me()
  setUser(user)
  return user
}

function useOnSignedIn() {
  const queryClient = useQueryClient()
  return (user: Awaited<ReturnType<typeof signIn>>) => {
    queryClient.setQueryData(authKeys.me, user)
    queryClient.invalidateQueries({ queryKey: cartKeys.all })
  }
}

export function useLogin() {
  const onSuccess = useOnSignedIn()
  return useMutation({
    mutationFn: signIn,
    onSuccess,
    onError: () => useAuthStore.getState().logout(),
  })
}

export function useRegister() {
  const onSuccess = useOnSignedIn()
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await authService.register(input)
      return signIn({ email: input.email, password: input.password })
    },
    onSuccess,
  })
}

/** Signs out and drops every cached customer query (cart, orders, profile...). */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return () => {
    useAuthStore.getState().signOut()
    queryClient.clear()
    router.replace('/')
  }
}
