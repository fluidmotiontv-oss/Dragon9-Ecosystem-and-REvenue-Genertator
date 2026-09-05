/**
 * DRAGON 9 ECOSYSTEM: CRYPTOGRAPHIC HASHING ENGINE
 * Generates immutable SHA-256 hashes for data objects.
 * Enforces deterministic serialization to guarantee structural integrity.
 */

export async function generateSHA256Hash(data: any): Promise<string> {
  // 1. Deterministic Serialization: Recursively sort object keys
  const serialize = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(serialize);
    }
    return Object.keys(obj)
      .sort()
      .reduce((result: Record<string, any>, key: string) => {
        result[key] = serialize(obj[key]);
        return result;
      }, {});
  };

  // 2. Encode to JSON string, then Uint8Array
  const serializedData = JSON.stringify(serialize(data));
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(serializedData);
  
  // 3. Generate SHA-256 Hash using native Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  
  // 4. Convert ArrayBuffer to Hex String
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
