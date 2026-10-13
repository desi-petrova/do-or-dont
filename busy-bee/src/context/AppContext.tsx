import { createContext } from 'react';
import type { UserState } from '../common/typeScriptDefinitions';

const AppContext = createContext<UserState>({
  user: null,
  userData: null,
  loading: false,
  callObject: null,
  setContext: () => { }
});

export default AppContext;
