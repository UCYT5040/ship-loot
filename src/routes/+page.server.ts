// Must be called server-side to avoid CORS issues
import type {PageServerLoad} from '../../.svelte-kit/types/src/routes/$types';

const usersAPI = 'https://shipwrecked.hackclub.com/api/users';

export interface User {
  id: string;
  name?: string;
  image?: string;
  createdAt: string;
  projects: any[];
  purchasedProgressHours: 0;
  totalShellsSpent: 0;
  adminShellAdjustment: 0;
}

export const load: PageServerLoad = async () => {
  const response = await fetch(usersAPI);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const users = await response.json() as User[];
  return { users };
}