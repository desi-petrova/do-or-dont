export const CARD_LABELS = [
  { name: 'Urgent', colorClass: 'bg-red-500' },
  { name: 'Pending', colorClass: 'bg-yellow-400' },
  { name: 'In Progress', colorClass: 'bg-blue-500' },
  { name: 'Needs Review', colorClass: 'bg-purple-500' },
  { name: 'Blocked', colorClass: 'bg-orange-500' },
  { name: 'Complete', colorClass: 'bg-green-500' },
  { name: 'Low Priority', colorClass: 'bg-gray-500' },
] as const;

const LEGACY_LABEL_COLORS: Record<string, string> = {
  Red: 'bg-red-500',
  Orange: 'bg-orange-500',
  Yellow: 'bg-yellow-400',
  Green: 'bg-green-500',
  Blue: 'bg-blue-500',
  Purple: 'bg-purple-500',
  Gray: 'bg-gray-500',
};

export const getCardLabelColor = (label: string): string =>
  CARD_LABELS.find(option => option.name === label)?.colorClass
  ?? LEGACY_LABEL_COLORS[label]
  ?? 'bg-gray-500';
