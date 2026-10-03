import axios from 'axios'
import { API_ORIGIN } from '@/utils/config'

/** axios instance for Server Components / ISR: talks to FastAPI directly, never from the browser. */
export const serverClient = axios.create({ baseURL: `${API_ORIGIN}/api/v1`, timeout: 10_000 })
