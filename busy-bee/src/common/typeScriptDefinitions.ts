import type { User } from 'firebase/auth';
import type { DailyCall } from '@daily-co/daily-js';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

export interface UserData {
  uid: string,
  handle: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  role: string,
  profilePhoto: string,
}

export interface UserState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  callObject: DailyCall | null;
  setContext: Dispatch<SetStateAction<UserState>>;
}

//Create Account
export interface FormUser {
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    email: string,
  }

export interface FormError {
    error: boolean,
    fieldErr: boolean,
    firstNameLength: boolean,
    lastNameLength: boolean,
    usernameErr: boolean,
    userNameTakenErr: boolean,
    passwordErr: boolean,
    emailErr: boolean,
    invalidImageFormat: boolean
  }

  // Board
  export interface NewBoard {
    title: string
  }

  export interface Board {
    id: string,
    title: string,
    owner: string,
  boardMembers?: Record<string, boolean>,
    list?: [id: string],
    cards?: [id: string],
  }

  
export interface FormNewBoardError {
    formErr: boolean,
    titleErr: boolean,
  }

export interface FormNewListError {
  formErr: boolean,
  titleErr: boolean,
}

export interface FormNewCardError {
  formErr: boolean,
  titleErr: boolean,
}

export interface LoginForm {
  email: string,
  password: string,
}

export interface ErrorLoginForm {
  error: boolean,
  fieldErr: boolean,
  email: boolean,
  password: boolean,
}

export interface LinksUserOptionsType {
  name: string,
  path: string,
}

export interface NavLinksProps {
  links: LinksUserOptionsType[];
}

export interface BodyProps {
  children: ReactNode;
  loading: boolean;
}

export interface RouteProps {
  children: ReactNode;
}

export interface UserSearchDropdownProps {
  users: UserData[];
  onSelect: (user: UserData) => void;
  placeholder?: string;
}

export type BoardList = (lists: string[]) => void;
export type BoardCard = (cards: string[]) => void;
export type BoardTitle = (title: string) => void;
export type BoardMembers = (memberUids: string[]) => void;
export type ListCards = (cards: string[]) => void;
export type CardLive = (card: CardDetails) => void;
export type UserBoard = (boards: string[]) => void;
export type UserQuestionnaire = (questionnaires: string[]) => void;
export type UserUpcomingQuizzesLive = (questionnaires: string[]) => void;
export type UserCompletedQuizzesLive = (questionnaires: string[]) => void;


//List
export interface List {
    id: string,
    name: string,
    owner: string,
    boardId: string,
    cards?: [id: string],
  }

export interface ListProps {
  list: List
}

export interface NewList {
    title: string
  }

export interface CreateNewListProps {
  idBoard: string
}

//Card
export interface Card{
  id: string,
  title: string,
  owner: string,
  boardId: string,
  listId: string,
}

export interface NewCard {
    title: string
  }

export interface CardProps {
  card: Card
}

export interface CreateNewCardProps {
  idBoard: string,
  idList: string,
}

export interface CardDetails{
  id: string,
  title: string,
  discription?: string,
  labels?: string[], 
  members?: string[],
  checklist?: string[],
  deadline?: string,
  chat?: string[]
  owner: string,
  boardId: string,
  listId: string,
}

export interface CardDetailsProps {
  cardId: string,
  initialCard: CardDetails,
}
