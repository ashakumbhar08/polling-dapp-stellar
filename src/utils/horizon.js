/**
 * horizon.js — All Horizon SSE logic lives here.
 * Exports: subscribeToContractEvents(contractId, onUpdate), unsubscribeAll()
 */
import { HORIZON_URL } from './config.js'

// Track active EventSource and fallback interval per contractId
const sources = new Map()      // contractId → EventSource
const fallbacks = new Map()    // contractId → intervalId
const FALLBACK_INTERVAL_MS = 5000
const RECONNECT_DELAY_MS = 3000

/**
 * subscribeToContractEvents(contractId, onUpdate)
 *
 * Opens an SSE stream on the Horizon /accounts/{contractId}/transactions endpoint.
 * On each new transaction event, calls onUpdate() so the caller can re-fetch results.
 *
 * Falls back to polling every 5 seconds if the SSE connection drops.
 * Returns a cleanup function that closes the stream and clears the fallback.
 */
export function subscribeToContractEvents(contractId, onUpdate) {
  if (!contractId) return () => {}

  // Clean up any existing subscription for this contract
  _closeSource(contractId)

  let useFallback = false
  let reconnectTimer = null

  function openSSE() {
    const url = `${HORIZON_URL}/accounts/${contractId}/transactions?cursor=now`

    let es
    try {
      es = new EventSource(url)
    } catch {
      // EventSource not available — go straight to fallback
      startFallback()
      return
    }

    sources.set(contractId, es)

    es.onmessage = () => {
      // Any new transaction on the contract account → trigger a results refresh
      onUpdate()
    }

    es.onerror = () => {
      es.close()
      sources.delete(contractId)

      if (!useFallback) {
        useFallback = true
        startFallback()
      }

      // Attempt SSE reconnect after delay
      reconnectTimer = setTimeout(() => {
        useFallback = false
        stopFallback()
        openSSE()
      }, RECONNECT_DELAY_MS)
    }
  }

  function startFallback() {
    if (fallbacks.has(contractId)) return
    const id = setInterval(() => onUpdate(), FALLBACK_INTERVAL_MS)
    fallbacks.set(contractId, id)
  }

  function stopFallback() {
    const id = fallbacks.get(contractId)
    if (id != null) {
      clearInterval(id)
      fallbacks.delete(contractId)
    }
  }

  openSSE()

  // Return cleanup
  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    _closeSource(contractId)
    stopFallback()
  }
}

/**
 * unsubscribeAll() — close every active SSE stream and fallback interval.
 * Call this on full app teardown.
 */
export function unsubscribeAll() {
  for (const contractId of sources.keys()) {
    _closeSource(contractId)
  }
  for (const id of fallbacks.values()) {
    clearInterval(id)
  }
  fallbacks.clear()
}

function _closeSource(contractId) {
  const es = sources.get(contractId)
  if (es) {
    es.close()
    sources.delete(contractId)
  }
}
