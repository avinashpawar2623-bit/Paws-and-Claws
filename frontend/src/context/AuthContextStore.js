import { createContext } from 'react'

// Isolated context export so React Refresh is not confused by provider exports.
export const AuthContext = createContext(null)

