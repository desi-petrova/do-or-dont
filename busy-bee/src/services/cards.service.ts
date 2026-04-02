import { get, set, ref, query, equalTo, orderByChild, update, DataSnapshot, onValue, remove,push } from 'firebase/database';
import { db } from '../config/firebaseConfig.ts';

export const createNewCard = (
  name: string,
  boardId: string
  listId: string  ) => {

  return push(ref(db, `boards`), {
  owner,
  title,
  createdOn: Date.now(),
  })
   .then(result => {
        if(result.key === null) return [];

        return getBoardById(result.key); 
    })
    .catch(e => console.error(e))
};

export const getBoardById = (id: string) => {
    return get(ref(db, `boards/${id}`))
      .then(result => {
        if (!result.exists()) {
          throw new Error(`Question with id ${id} does not exist!`);
        }
        const board = result.val();
        board.id = id;
        board.createdOn = new Date(board.createdOn);

        return board;
      })
      .catch(e => console.error(e));
  };