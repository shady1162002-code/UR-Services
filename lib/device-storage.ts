/**
 * Get or create a unique device ID
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return ""
  
  let deviceId = localStorage.getItem("device_id")
  
  if (!deviceId) {
    // Generate a unique device ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem("device_id", deviceId)
  }
  
  return deviceId
}

/**
 * Save customer name for a specific company
 */
export function saveCustomerName(companySlug: string, name: string, email?: string): void {
  if (typeof window === "undefined") return
  
  const key = `customer_${companySlug}`
  const data = {
    name: name.trim(),
    email: email?.trim() || "",
    savedAt: new Date().toISOString(),
  }
  
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Get saved customer name for a specific company
 */
export function getSavedCustomerName(companySlug: string): { name: string; email: string } | null {
  if (typeof window === "undefined") return null
  
  const key = `customer_${companySlug}`
  const saved = localStorage.getItem(key)
  
  if (!saved) return null
  
  try {
    const data = JSON.parse(saved)
    return {
      name: data.name || "",
      email: data.email || "",
    }
  } catch {
    return null
  }
}
