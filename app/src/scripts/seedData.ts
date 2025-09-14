import { Character, createStash, STASH_CHARACTER, STASH_ID } from '@/storage/entities/character.js'
import { db } from '../storage/firebase.js'
import { faker } from '@faker-js/faker'
import { MagicItem, magicItemDao } from '@/storage/entities/magicItem.js'
import { characterDao } from '@/storage/entities/character.js'
import { run } from 'node:test'
import { clear } from 'console'

// Seed 3 characters, each with 3 magicItems

export function clearDb() {
  return Promise.all([characterDao.clear(db), magicItemDao.clear(db)]);
}

export async function seedData() {
  await clearDb();
  var chars: Promise<Character>[] = []
  
  chars.push(createStash(db));
  for (let i = 0; i < 3; i++) {
    const character: Character = {
      name: faker.person.fullName(),
      description: faker.person.jobDescriptor(),
      attunedItemIds: []
    };
    chars.push(characterDao.create(db, character));
  }
  
  
  const charObjects = await Promise.all(chars);

  for (let j = 0; j < 3; j++) {
    const magicItem: MagicItem = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      ownerId: STASH_ID,
      isAttuned: false
    };
    magicItemDao.create(db, magicItem);
  }
}
export default {
  run: (array: any[], args: any, kwargs: any) => {
    seedData()
  }
}


seedData()
