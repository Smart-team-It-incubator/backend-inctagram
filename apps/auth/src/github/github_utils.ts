import { CoreAppApiService } from "@core-app-api/core-app-api";


// Генерация username из email
export function generateUsernameFromEmail(email: string): string {
  const [localPart] = email.split('@'); // Берем часть до @
  return `${localPart}_${Math.random().toString(36).substring(2, 8)}`; // Генерация с уникальным суффиксом
}

// Проверка уникальности username и генерация уникального
export async function getUniqueUsername(baseUsername: string, coreAppApiService: CoreAppApiService): Promise<string> {
    let username = baseUsername;
    let isTaken = await coreAppApiService.getUserByUsername(username);

    let attempts = 0;
    // Генерируем уникальный username, если он занят (с ограничением на количество попыток)
    while (isTaken && attempts < 10) {
      username = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
      isTaken = await coreAppApiService.getUserByUsername(username);
      attempts++;
    }

    if (attempts >= 10) {
      throw new Error('Unable to generate a unique username after multiple attempts');
    }

    return username;
}