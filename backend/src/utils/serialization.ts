// Helper to serialize Prisma Decimal objects to string in JSON responses
export function serializeDecimal<T>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal);
  }
  
  if (typeof obj === "object") {
    // Check if it's a Prisma Decimal
    if ("d" in obj && "e" in obj && "s" in obj) {
      return obj.toString();
    }
    
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDecimal(value);
    }
    return serialized;
  }
  
  return obj;
}
