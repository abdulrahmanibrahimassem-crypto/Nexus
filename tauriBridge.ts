/**
 * Zenith Core - Tauri Native Desktop Bridge
 * Provides typed wrappers for native Rust Tauri v2 commands and event emitters,
 * with graceful browser fallbacks for development.
 */

import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export interface ESP32TelemetryPacket {
  device_id: string;
  cpu_temp: number;
  rssi_dbm: number;
  free_heap_bytes: number;
  packet_counter: number;
  hmac_valid: boolean;
  timestamp?: string;
}

export interface VaultWriteResult {
  success: boolean;
  file_size_bytes: number;
  sha256_checksum: string;
}

/** Check if running within a native Tauri desktop environment */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).__TAURI_INTERNALS__);
}

/**
 * Computes high-throughput SHA-256 / Blake3 hash on the native Rust Tokio worker thread pool.
 * Does not block the React UI event loop.
 */
export async function computeNativeHash(payload: string): Promise<string> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<string>('compute_secure_hash', { payload });
    } catch (err) {
      console.warn('[TAURI_BRIDGE] Native hash invoke failed, falling back to WebCrypto:', err);
    }
  }

  // Fallback: Web Crypto API in browser
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Persists an encrypted vault file into the sandboxed $APPDATA/ZenithVaults folder with atomic disk writes.
 */
export async function persistVaultToDisk(
  vaultId: string,
  encryptedBase64: string
): Promise<VaultWriteResult> {
  if (isTauriEnvironment()) {
    // Convert base64 to byte array
    const binaryString = atob(encryptedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return await invoke<VaultWriteResult>('persist_vault_payload', {
      vaultId,
      encryptedBytes: Array.from(bytes),
    });
  }

  // Browser simulation fallback: localStorage with virtual checksum
  const checksum = await computeNativeHash(encryptedBase64);
  localStorage.setItem(`zenith_vault_${vaultId}`, encryptedBase64);
  return {
    success: true,
    file_size_bytes: encryptedBase64.length,
    sha256_checksum: checksum,
  };
}

/**
 * Subscribes to the high-frequency non-blocking UDP telemetry stream broadcasted by ESP32 devices via Rust.
 */
export async function subscribeToESP32Telemetry(
  onPacket: (packet: ESP32TelemetryPacket) => void
): Promise<UnlistenFn> {
  if (isTauriEnvironment()) {
    return await listen<ESP32TelemetryPacket>('esp32-telemetry-packet', (event) => {
      onPacket(event.payload);
    });
  }

  // Browser simulation fallback: Periodic heartbeat pulse
  const interval = window.setInterval(() => {
    onPacket({
      device_id: 'ESP32-S3-SIMULATED-CORE',
      cpu_temp: 42.5 + (Math.random() * 4 - 2),
      rssi_dbm: -58 + Math.floor(Math.random() * 6),
      free_heap_bytes: 284500 + Math.floor(Math.random() * 1200),
      packet_counter: Date.now(),
      hmac_valid: true,
      timestamp: new Date().toISOString(),
    });
  }, 2500);

  return () => {
    window.clearInterval(interval);
  };
}
