export const blockedWords = [
  "violence",
  "weapon",
  "kill",
  "hate",
  "blood",
  "drugs",
  "adult",
  "attack",
  "fight",
];

export function containsBlockedWord(input: string): boolean {
  const lowerInput = input.toLowerCase();
  return blockedWords.some((word) => lowerInput.includes(word));
}
