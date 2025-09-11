import { capitalize } from './utils.js';

// this is just to figure out winner + verb
export type rpsChoice = {
    description: string;
    virus?: string;
    computer?: string;
    scissors?: string;
    wumpus?: string;
    rock?: string;
    paper?: string;
    cowboy?: string;
};

// To keep track of our active games
export interface ActiveGame {
  id: string;
  objectName: keyof rpsChoice;
};

const rpsChoices: Record<string, rpsChoice> = {
  rock: {
    description: 'sedimentary, igneous, or perhaps even metamorphic',
    virus: 'outwaits',
    computer: 'smashes',
    scissors: 'crushes',
  },
  cowboy: {
    description: 'yeehaw~',
    scissors: 'puts away',
    wumpus: 'lassos',
    rock: 'steel-toe kicks',
  },
  scissors: {
    description: 'careful ! sharp ! edges !!',
    paper: 'cuts',
    computer: 'cuts cord of',
    virus: 'cuts DNA of',
  },
  virus: {
    description: 'genetic mutation, malware, or something inbetween',
    cowboy: 'infects',
    computer: 'corrupts',
    wumpus: 'infects',
  },
  computer: {
    description: 'beep boop beep bzzrrhggggg',
    cowboy: 'overwhelms',
    paper: 'uninstalls firmware for',
    wumpus: 'deletes assets for',
  },
  wumpus: {
    description: 'the purple Discord fella',
    paper: 'draws picture on',
    rock: 'paints cute face on',
    scissors: 'admires own reflection in',
  },
  paper: {
    description: 'versatile and iconic',
    virus: 'ignores',
    cowboy: 'gives papercut to',
    rock: 'covers',
  },
};



export function getResult(p1: ActiveGame, p2: ActiveGame) {
  let gameResult;
  if (rpsChoices[p1.objectName] && rpsChoices[p1.objectName][p2.objectName]) {
    // o1 wins
    gameResult = {
      win: p1,
      lose: p2,
      verb: rpsChoices[p1.objectName][p2.objectName],
    };
  } else if (
    rpsChoices[p2.objectName] &&
    rpsChoices[p2.objectName][p1.objectName]
  ) {
    // o2 wins
    gameResult = {
      win: p2,
      lose: p1,
      verb: rpsChoices[p2.objectName][p1.objectName],
    };
  } else {
    // tie -- win/lose don't
    gameResult = { win: p1, lose: p2, verb: 'tie' };
  }

  return formatResult(gameResult);
}

function formatResult(result: { win: any; lose: any; verb: any; }) {
  const { win, lose, verb } = result;
  return verb === 'tie'
    ? `<@${win.id}> and <@${lose.id}> draw with **${win.objectName}**`
    : `<@${win.id}>'s **${win.objectName}** ${verb} <@${lose.id}>'s **${lose.objectName}**`;
}

export function getRPSChoices(): (keyof rpsChoice)[] {
  return Object.keys(rpsChoices) as (keyof rpsChoice)[];
}

// Function to fetch shuffled options for select menu
export function getShuffledOptions() {
  const allChoices = getRPSChoices();
  const options = [];

  for (let c of allChoices) {
    // Formatted for select menus
    // https://discord.com/developers/docs/components/reference#string-select-select-option-structure
    options.push({
      label: capitalize(c),
      value: c.toLowerCase(),
      description: rpsChoices[c]['description'],
    });
  }

  return options.sort(() => Math.random() - 0.5);
}
