import { get, set, ref, query, equalTo, orderByChild, update, DataSnapshot, onValue, remove,push } from 'firebase/database';
import { db } from '../config/firebaseConfig.ts';

export const createNewList = (
  name: string,
  boardId: string,
  owner: string
  ) => {

  return push(ref(db, `lists`), {
  name,
  boardId,
  owner,
  createdOn: Date.now(),
  })
   .then(result => {
        if(result.key === null) return [];

        return getListById(result.key); 
    })
    .catch(e => console.error(e))
};

export const getListById = (id: string) => {
    return get(ref(db, `lists/${id}`))
      .then(result => {
        if (!result.exists()) {
          throw new Error(`List with id ${id} does not exist!`);
        }
        const list = result.val();
        list.id = id;
        list.createdOn = new Date(list.createdOn);

        return list;
      })
      .catch(e => console.error(e));
  };

  export const updateListCards = (cardId: string, listId: string) => {
  return update(ref(db), { [`lists/${listId}/listCards/${cardId}`]: true })
}

export interface ListCards { (lists: string[]): void }

export const getListCardsLive = (listId: string, listener: ListCards) => {

  return onValue(ref(db, `lists/${listId}/listCards`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const listCards = Object.keys(snapshot.val());
  
    return listener(listCards)
  })
}