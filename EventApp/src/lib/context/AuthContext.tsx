"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"
import type { AuthState, User, AuthTokens } from "../types/index"
import { storage } from "../utils/storage"
import { clearDefaultAuthorization, setDefaultAuthorization } from "../hooks/useApi"

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; tokens: AuthTokens } }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: { user: User; tokens: AuthTokens } }
  | { type: "SET_ERROR"; payload: string }

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  loading: true,
  error: null,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        loading: false,
        error: null,
      }
    case "LOGIN_ERROR":
      return { ...state, loading: false, error: action.payload }
    case "LOGOUT":
      return { ...initialState, loading: false }
    case "RESTORE_SESSION":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        loading: false,
      }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    default:
      return state
  }
}

interface AuthContextType {
  state: AuthState
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  restoreSession: () => void
  setError: (error: string) => void
  isOrganizador: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = (user: User, tokens: AuthTokens) => {
    storage.setToken(tokens.access)
    storage.setRefreshToken(tokens.refresh)
    storage.setUser(user)
    setDefaultAuthorization(tokens.access)
    dispatch({ type: "LOGIN_SUCCESS", payload: { user, tokens } })
  }

  const logout = () => {
    storage.clearAll()
    clearDefaultAuthorization()
    dispatch({ type: "LOGOUT" })
  }

  const restoreSession = useCallback(() => {
    const token = storage.getToken()
    const user = storage.getUser()
    const refreshToken = storage.getRefreshToken()

    if (token && user && refreshToken) {
      dispatch({
        type: "RESTORE_SESSION",
        payload: { user, tokens: { access: token, refresh: refreshToken } },
      })
    } else {
      // somente desloga se já não estivermos no estado inicial (evita dispatchs desnecessários)
      dispatch({ type: "LOGOUT" })
    }
  }, [])

  const setError = (error: string) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  const isOrganizador = () => {
    return state.user?.role === "organizador"
  }

  return (
    <AuthContext.Provider value={{ state, login, logout, restoreSession, setError, isOrganizador }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}
