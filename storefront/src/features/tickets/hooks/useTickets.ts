import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketsService } from '../services/ticketsService'

export const ticketKeys = {
  all: ['tickets'] as const,
  list: ['tickets', 'list'] as const,
  detail: (id: number) => ['tickets', 'detail', id] as const,
}

export function useMyTickets() {
  return useQuery({ queryKey: ticketKeys.list, queryFn: ticketsService.mine })
}

export function useTicket(id: number) {
  return useQuery({ queryKey: ticketKeys.detail(id), queryFn: () => ticketsService.get(id) })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ticketsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.list }),
  })
}

export function useReplyTicket(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => ticketsService.reply(id, message),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketKeys.detail(id), ticket)
      queryClient.invalidateQueries({ queryKey: ticketKeys.list })
    },
  })
}
