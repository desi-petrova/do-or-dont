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
import CreateNewBoard from './components/CreateNewBoard/CreateNewBoard';
import BoardView from './components/BoardView/BoardView';

function App() {
  const [userAuth, loading] = useAuthState(auth);
  const [appState, setAppState] = useState<UserState>({
    loading: true,
    user: null,
    userData: null,
    callObject: null,
    setContext: () => { },
  });

  useEffect(() => {
    if (loading) return;

    if (!userAuth) {
      setAppState(prevState => ({
        ...prevState,
        loading: false,
        user: null,
        userData: null,
      }));
      return;
    }

    let isCurrent = true;

    setAppState(prevState => ({
      ...prevState,
      loading: true,
      user: userAuth,
      userData: null,
    }));

    getUserData(userAuth.uid)
      .then(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Something went wrong!');
        }

        if (isCurrent) {
          setAppState(prevState => ({
            ...prevState,
            loading: false,
            userData: snapshot.val()[Object.keys(snapshot.val())[0]],
          }));
        }
      })
      .catch(e => {
        if (!isCurrent) return;

        setAppState(prevState => ({
          ...prevState,
          loading: false,
          userData: null,
        }));
        alert(e.message);
      });

    return () => {
      isCurrent = false;
    };
  }, [userAuth, loading]);

  return (
    <div>
    <Router>
    <AppContext.Provider value={{ ...appState, setContext: setAppState }}>
      <Body loading={appState.loading}>
        <Routes>

        <Route path='/login' element={!appState.user && <Login />} />
        <Route path='/createAccount' element={!appState.user && <CreateAccount />} />
        <Route path='/createNewBoard' element={<AuthenticatedRoute><CreateNewBoard /> </AuthenticatedRoute>} />
        <Route path='/boardView' element={<AuthenticatedRoute><BoardView /></AuthenticatedRoute>} />
        <Route path='/boardView/:idBoard' element={<AuthenticatedRoute><BoardView /></AuthenticatedRoute>} />



          

        <Route path='*' element={<NoPageFound />} />
        </Routes>
      </Body>
    </AppContext.Provider>
    </Router>
    </div>
  )
}

export default App
