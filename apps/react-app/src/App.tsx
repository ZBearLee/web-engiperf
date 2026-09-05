import type { RouteObject } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import { routes } from '@/router/modules'

export default function App() {
  return useRoutes(routes as RouteObject[])
}
