import { get, set, ref, query, equalTo, orderByChild, update, DataSnapshot, onValue, remove,push } from 'firebase/database';
import { db } from '../config/firebaseConfig.ts';

export const createNewCard = (
  owner: string,
  title: string,
  boardId: string,
  listId: string,  ) => {

  return push(ref(db, `cards`), {
  owner,
  title,
  boardId,
  listId,
  createdOn: Date.now(),
  })
   .then(result => {
        if(result.key === null) return [];

        return getCardById(result.key); 
    })
    .catch(e => console.error(e))
};

export const getCardById = (id: string) => {
    return get(ref(db, `cards/${id}`))
      .then(result => {
        if (!result.exists()) {
          throw new Error(`Card with id ${id} does not exist!`);
        }
        const card = result.val();
        card.id = id;
        card.createdOn = new Date(card.createdOn);

        return card;
      })
      .catch(e => console.error(e));
  };