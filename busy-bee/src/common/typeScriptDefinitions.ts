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
    list?: [id: string],
    cards?: [id: string],
  }

  
export interface FormNewBoardError {
    formErr: boolean,
    titleErr: boolean,
  }


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
    name: string,
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
