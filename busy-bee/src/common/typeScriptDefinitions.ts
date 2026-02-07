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

  export interface NewBoard {
    title: string
  }

  
export interface FormNewBoardError {
    formErr: boolean,
    titleErr: boolean,
  }