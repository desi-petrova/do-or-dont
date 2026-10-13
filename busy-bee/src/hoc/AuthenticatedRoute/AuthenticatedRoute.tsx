import { useContext} from 'react';
import AppContext from '../../context/AppContext';
import type { RouteProps, UserState } from '../../common/typeScriptDefinitions.ts';
import { Navigate, useLocation  } from 'react-router-dom';

const AuthenticatedRoute = ({ children } : RouteProps) => {
  const { user, userData } = useContext<UserState>(AppContext);
  const location = useLocation();

  if (user === null || userData === null) {
    return <Navigate to='/login' state={location.pathname} />;
  } 

  return children;
}

export default AuthenticatedRoute;
