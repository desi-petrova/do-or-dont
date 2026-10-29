import type { UserData } from './typeScriptDefinitions';

export const getInitials = (user: Pick<UserData, 'firstName' | 'lastName'>): string =>
  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
