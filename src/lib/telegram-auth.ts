import type { TelegramUser } from '@/contexts/AuthContext';

export async function verifyTelegramAuth(data: Record<string, unknown>): Promise<TelegramUser> {
  const res = await fetch('/api/telegram-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Auth failed' }));
    throw new Error(err.error || 'Auth failed');
  }
  const { user } = await res.json();
  return user;
}
