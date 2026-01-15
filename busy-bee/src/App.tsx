import { useState,useEffect } from 'react'
import './App.css'
import AppContext from './context/AppContext'; 
import type { UserState } from './context/AppContext'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getUserData } from './services/users.service';
import { useAuthState } from 'react-firebase-hooks/auth';
import AuthenticatedRoute from './hoc/AuthenticatedRoute/AuthenticatedRoute';
import Body from './hoc/Body/Body';
import NoPageFound from './views/NoPageFound/NoPageFound';
import { auth } from './config/firebaseConfig';
import Login from './views/Login/Login';
import CreateAccount from './components/CreateAccount/CreateAccount';


function App() {
  const [userAuth, loading] = useAuthState(auth);
  const [appState, setAppState] = useState<UserState>({
    loading: userAuth == null ? false : true,
    user: null,
    userData: null,
    callObject: null,
    setContext: () => { },
  });

  if (appState.user !== userAuth) {
    setAppState((prevState: UserState) => ({
      ...prevState,
      user: userAuth || null,
    }));
  }

  useEffect(() => {
    if (userAuth === null || userAuth === undefined) {
      if (!loading) {
        setTimeout(() => {
        setAppState(prevState => ({
          ...prevState,
          loading: false,
        }));
        }, 0);
      }
      return;
    }

    getUserData(userAuth.uid)
      .then(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Something went wrong!');
        }

        setAppState(prevState => ({
          ...prevState,
          loading: false,
          userData: snapshot.val()[Object.keys(snapshot.val())[0]],
        }));
      })
      .catch(e => alert(e.message))
  }, [userAuth, loading]);

  return (
    <div>
    <Router>
    <AppContext.Provider value={{ ...appState, setContext: setAppState }}>
      {!appState.loading && <Body>
        <Routes>

        <Route path='/login' element={!appState.user && <Login />} />
        <Route path='/createAccount' element={!appState.user && <CreateAccount />} />


          

        <Route path='*' element={<NoPageFound />} />
        </Routes>
      </Body>}
    </AppContext.Provider>
    </Router>
    </div>
  )
}

export default App
