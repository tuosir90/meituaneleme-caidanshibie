'use client'

import { useMediaQuery } from 'react-responsive'

export function useIsMobile() {
  return useMediaQuery({ maxWidth: 768 })
}

export function useIsTablet() {
  return useMediaQuery({ minWidth: 769, maxWidth: 1024 })
}

export function useIsDesktop() {
  return useMediaQuery({ minWidth: 1025 })
}

export { useMediaQuery }
