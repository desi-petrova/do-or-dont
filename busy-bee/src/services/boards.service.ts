import { get, set, ref, query, equalTo, orderByChild, update, DataSnapshot, onValue, remove,push } from 'firebase/database';
import { db } from '../config/firebaseConfig.ts';

export const createNewBoard = (
  owner: string,
  title:string) => {

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
          throw new Error(`Board with id ${id} does not exist!`);
        }
        const board = result.val();
        board.id = id;
        board.createdOn = new Date(board.createdOn);

        return board;
      })
      .catch(e => console.error(e));
  };


export const updateBoardLists = (listId: string, boardId: string) => {
  return update(ref(db), { [`boards/${boardId}/boardLists/${listId}`]: true })
}

export const updateBoardCards = (cardId: string, boardId: string) => {
  return update(ref(db), { [`boards/${boardId}/boardCards/${cardId}`]: true })
}

export interface BoardList { (lists: string[]): void }

export const getBoardListsLive = (boardId: string, listener: BoardList) => {

  return onValue(ref(db, `boards/${boardId}/boardLists`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const myBoards = Object.keys(snapshot.val());
  
    return listener(myBoards)
  })
}