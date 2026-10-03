import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/store/authStore'
import { authKeys } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.updateMe,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
      useAuthStore.getState().setUser(user)
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: authService.changePassword })
}
