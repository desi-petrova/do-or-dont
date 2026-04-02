import { get, set, ref, query, equalTo, orderByChild, update, DataSnapshot, onValue, remove } from 'firebase/database';
import { db } from '../config/firebaseConfig.ts';

export const getUserByHandle = (handle: string): Promise<DataSnapshot> => {
  return get(ref(db, `users/${handle}`));
};

export const createUserHandle = (
  handle: string,
  uid: string,
  email: string,
  firstName: string,
  lastName: string): Promise<void> => {

  return set(ref(db, `users/${handle}`), {
    handle,
    uid,
    email,
    firstName,
    lastName,
    profilePhoto: '',
    role: "user",
    isBlocked: false,
  })
};

export const getUserData = (uid: string): Promise<DataSnapshot> => {
  return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};

export const updateUserData = (handle: string, key: string, value: string | boolean): Promise<void> => {
  return update(ref(db), { [`users/${handle}/${key}`]: value });
};

export const updateUserBoards = (uid: string, handle: string) => {
  return update(ref(db), { [`users/${handle}/myBoards/${uid}`]: true })
}

export interface UserBoard { (boards: string[]): void }

export const getUserBoardsLive = (handle: string, listener: UserBoard) => {

  return onValue(ref(db, `users/${handle}/myBoards`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const myBoards = Object.keys(snapshot.val());
    return listener(myBoards)
  })
}

export const updateUserCards = (uid: string, handle: string) => {
  return update(ref(db), { [`users/${handle}/myCards/${uid}`]: true })
}

export const updateUserLists = (uid: string, handle: string) => {
  return update(ref(db), { [`users/${handle}/myLists/${uid}`]: true })
}

export interface UserQuestionnaire { (questionnaires: string[]): void }

export const getUserQuestionnaireLive = (handle: string, listener: UserQuestionnaire) => {

  return onValue(ref(db, `users/${handle}/myQuestionnaires`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const myQuestionnaires = Object.keys(snapshot.val());
    return listener(myQuestionnaires)
  })
}

export const updateUserQuestions = (handle: string, idQuestion: string): Promise<void> => {
  return update(ref(db), { [`users/${handle}/myQuestions/${idQuestion}`]: true });
};

export const updateUserAnswers = (handle: string, idAnswer: string): Promise<void> => {
  return update(ref(db), { [`users/${handle}/myAnswers/${idAnswer}`]: true });
};

export const updateUserCompletedQuiz = (handle: string, idQuiz: string ) => {
  return update(ref(db), { [`users/${handle}/myCompletedQuizzes/${idQuiz}`]: true})
}

export const updateUserQuizAnswers = (handle: string, answer: string ) => {
  return update(ref(db), { [`users/${handle}/quizAnswers/${answer}`]: true})
}

export const getAllUsersData = (): Promise<DataSnapshot> => {
  return get(query(ref(db, 'users')));
};

export const updateUserUpcomingQuizzes = (handle: string, idQuestionnaire: string ) => {
  return update(ref(db), { [`users/${handle}/upcomingQuizzes/${idQuestionnaire}`]: true})
}

export interface UserUpcomingQuizzesLive { (questionnaires: string[]): void }

export const getUserUpcomingQuizzesLive = (handle: string, listener: UserUpcomingQuizzesLive) => {

  return onValue(ref(db, `users/${handle}/upcomingQuizzes`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const myQuestionnaires = Object.keys(snapshot.val());
    return listener(myQuestionnaires)
  })
}

export interface UserCompletedQuizzesLive { (questionnaires: string[]): void }

export const getUserCompletedQuizzesLive = (handle: string, listener: UserCompletedQuizzesLive) => {

  return onValue(ref(db, `users/${handle}/myCompletedQuizzes`), (snapshot) => {
    if (!snapshot.exists()) return [];
    const myQuizzes = Object.keys(snapshot.val());
    return listener(myQuizzes)
  })
}

export const getUserCompletedQuizzesId = (handle: string) => {

  return get(ref(db, `users/${handle}`))
  .then(result => {
    if (!result.exists()) {
      throw new Error(`User with User ${handle} does not exist!`);
    }
    const user = result.val();
    if(user.myCompletedQuizzes){
      user.myCompletedQuizzes = Object.keys(user.myCompletedQuizzes)
    } else {
      user.myCompletedQuizzes = []
    }
          
    return  user.myCompletedQuizzes
  })
  .catch(e => console.error(e))

}

export const removeUserQuestionnaire = (questionnaireId: string, handle: string) => {
  remove(ref(db, `users/${handle}/myQuestionnaires/${questionnaireId}`));
}

export const removeUserUpcomingQuizzes = (questionnaireId: string, handle: string) => {
  remove(ref(db, `users/${handle}/upcomingQuizzes/${questionnaireId}`));
}

export const removeUserMyQuestions = (questionId: string, handle: string) => {
  remove(ref(db, `users/${handle}/myQuestions/${questionId}`));
}

export const removeUserMyAnswers = (answerId: string, handle: string) => {
  remove(ref(db, `users/${handle}/myAnswers/${answerId}`));
}


