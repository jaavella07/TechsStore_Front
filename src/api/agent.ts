import axios from 'axios'
import { AGENT_URL } from '@/lib/constants'
import type { ChatRequest, ChatResponse } from '@/types'

const agentClient = axios.create({
  baseURL: AGENT_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const agentApi = {
  chat: (dto: ChatRequest) =>
    agentClient.post<ChatResponse>('/chat', dto).then((r) => r.data),
}
