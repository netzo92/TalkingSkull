export interface TokenRequest {
  identity: string;
  room?: string;
}

export interface TokenResponse {
  token: string;
  url: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

export const requestJoinToken = async (payload: TokenRequest): Promise<TokenResponse> => {
  const response = await fetch(`${API_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to obtain LiveKit token');
  }

  return response.json() as Promise<TokenResponse>;
};
