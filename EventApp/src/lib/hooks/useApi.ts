import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import { API_BASE_URL, API_ENDPOINTS } from "../constants/api"
import { storage } from "../utils/storage"

let apiClient: AxiosInstance | null = null
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown | null, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else if (token) {
      resolve(token)
    }
  })
  pendingQueue = []
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  })

  // Request interceptor para adicionar token
  client.interceptors.request.use(
    (config) => {
      const token = storage.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor para tratar erros de autenticação com tentativa de refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {}
      const requestUrl = (originalRequest && (originalRequest.url as string)) || ""

      // Se não for 401, apenas propaga erro
      if (error.response?.status !== 401) {
        return Promise.reject(error)
      }

      // Não tentar refresh nem redirecionar em chamadas de login (evita reload na tela de login)
      try {
        if (requestUrl && (requestUrl.endsWith(API_ENDPOINTS.LOGIN) || requestUrl.includes(API_ENDPOINTS.LOGIN))) {
          return Promise.reject(error)
        }
      } catch {
        // ignora parsing da URL
      }

      // Evitar loops infinitos
      if (originalRequest._retry) {
        storage.clear()
        window.location.href = "/login"
        return Promise.reject(error)
      }
      originalRequest._retry = true

      const refreshToken = storage.getRefreshToken()
      if (!refreshToken) {
        storage.clear()
        window.location.href = "/login"
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Aguarda o refresh atual concluir
        try {
          const newToken: string = await new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject })
          })
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return client.request(originalRequest)
        } catch (err) {
          storage.clear()
          window.location.href = "/login"
          return Promise.reject(err)
        }
      }

      // Inicia fluxo de refresh
      isRefreshing = true
      try {
        const { data } = await client.post(API_ENDPOINTS.REFRESH, { refresh: refreshToken })
        const newAccess: string | undefined = data?.access
        if (!newAccess) throw new Error("Refresh sem access token")

        // Atualiza storage e cabeçalhos default
        storage.setToken(newAccess)
        client.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        processQueue(null, newAccess)

        // Reenvia requisição original com novo token
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return client.request(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        storage.clear()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    },
  )

  return client
}

export const useApi = (): AxiosInstance => {
  if (!apiClient) {
    apiClient = createApiClient()
  }
  return apiClient
}

// Helpers para sincronizar cabeçalho Authorization com ciclos de login/logout
export const setDefaultAuthorization = (token?: string) => {
  if (!apiClient) return
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

export const clearDefaultAuthorization = () => {
  if (!apiClient) return
  delete apiClient.defaults.headers.common.Authorization
}
