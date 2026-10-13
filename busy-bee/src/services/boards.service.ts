import { get, set, ref, query, equalTo, orderByChild, update, DataSnapshot, onValue, remove,push } from 'firebase/database';
import { db } from '../config/firebaseConfig.ts';
import type { BoardCard, BoardList, BoardMembers, BoardTitle, UserData } from '../common/typeScriptDefinitions.ts';

export const createNewBoard = (
  owner: string,
  title: string) => {

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

export const addBoardMembers = (boardId: string, members: UserData[]) => {
  const updates: Record<string, boolean> = {};

  members.forEach(member => {
    updates[`boards/${boardId}/boardMembers/${member.uid}`] = true;
    updates[`users/${member.handle}/myBoards/${boardId}`] = true;
  });

  return Object.keys(updates).length > 0
    ? update(ref(db), updates)
    : Promise.resolve();
};

export const getBoardMembersLive = (boardId: string, listener: BoardMembers) => {
  return onValue(ref(db, `boards/${boardId}/boardMembers`), snapshot => {
    const memberUids = snapshot.exists() ? Object.keys(snapshot.val()) : [];
    listener(memberUids);
  });
};

export const getBoardListsLive = (boardId: string, listener: BoardList) => {

  return onValue(ref(db, `boards/${boardId}/boardLists`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const BoardLists = Object.keys(snapshot.val());
  
    return listener(BoardLists)
  })
}


export const getBoardCardsLive = (boardId: string, listener: BoardCard) => {

  return onValue(ref(db, `boards/${boardId}/boardCards`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const BoardCards = Object.keys(snapshot.val());
  
    return listener(BoardCards)
  })
}

export const getBoardTitleLive = (boardId: string, listener: BoardTitle) => {

  return onValue(ref(db, `boards/${boardId}/title`), (snapshot) => {
    if (!snapshot.exists()) return [];
  
    return listener(snapshot.val())
  })
}
