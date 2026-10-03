import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketsService } from '../services/ticketsService'
import type { Ticket } from '../types'

export const ticketKeys = {
  all: ['tickets'] as const,
  list: (status?: string) => [...ticketKeys.all, 'list', status ?? 'all'] as const,
  detail: (id: number) => [...ticketKeys.all, 'detail', id] as const,
}

export function useTickets(status?: string) {
  return useQuery({ queryKey: ticketKeys.list(status), queryFn: () => ticketsService.list(status) })
}

export function useTicket(id: number) {
  return useQuery({ queryKey: ticketKeys.detail(id), queryFn: () => ticketsService.get(id) })
}

/** Both actions return the updated ticket: write it straight into the cache, refresh the lists. */
function useTicketMutationSuccess(id: number) {
  const queryClient = useQueryClient()
  return (ticket: Ticket) => {
    queryClient.setQueryData(ticketKeys.detail(id), ticket)
    queryClient.invalidateQueries({ queryKey: ticketKeys.all })
  }
}

export function useReplyTicket(id: number) {
  const onSuccess = useTicketMutationSuccess(id)
  return useMutation({ mutationFn: (message: string) => ticketsService.reply(id, message), onSuccess })
}

export function useCloseTicket(id: number) {
  const onSuccess = useTicketMutationSuccess(id)
  return useMutation({ mutationFn: () => ticketsService.close(id), onSuccess })
}
