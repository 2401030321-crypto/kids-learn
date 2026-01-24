const bannedWords = {
  sexual: [
    "sex", "sexual", "porn", "porno", "nude", "naked", "boobs", "breasts",
    "penis", "vagina", "dick", "cock", "pussy", "ass", "butt",
    "blowjob", "handjob", "oral", "cum", "semen", "fuck", "fucking",
    "screw", "horny", "kinky", "strip", "masturbate", "orgasm"
  ],

  drugs: [
    "drugs", "drug", "weed", "marijuana", "ganja", "hash",
    "cocaine", "heroin", "lsd", "mdma", "ecstasy", "meth",
    "alcohol", "beer", "vodka", "whiskey", "rum", "smoking",
    "cigarette", "tobacco", "joint", "high"
  ],

  violence: [
    "kill", "killing", "murder", "dead", "death", "die",
    "stab", "shoot", "gun", "knife", "bomb", "fight",
    "punch", "hit", "slap", "blood", "hurt", "injure",
    "attack", "violence", "weapon"
  ],

  abuse: [
    "idiot", "stupid", "dumb", "moron", "loser", "ugly",
    "hate", "shut up", "bastard", "bloody",
    "retard", "crazy", "mad", "fool"
  ],

  selfHarm: [
    "suicide", "self harm", "kill myself", "die myself",
    "cut myself", "end my life"
  ]
};

const allBadWords = Object.values(bannedWords).flat();

export function filterMessage(message: string): string {
  let filtered = message;

  for (const word of allBadWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, "***");
  }

  return filtered;
}
