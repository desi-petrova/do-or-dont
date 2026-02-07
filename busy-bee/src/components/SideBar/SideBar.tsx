import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import { logoutUser } from '../../services/auth.service';
import NavButtons from '../NavButtons/NavButtons';
import Members from '../Members/Members';
import BoardsNav from '../BoardsNav/BoardsNav';


export interface LinksUserOptionsType {
  name: string,
  path: string
}

const LinksUserOptions: LinksUserOptionsType[] = [
  { name: 'Create Account', path: '/createAccount' },
  { name: 'Login', path: '/login' }
];

const SideBar = () => {
 const { userData, setContext } = useContext(AppContext);
 const navigate = useNavigate();

 const onLogout = () => {
    logoutUser()
      .then(() => {
        setContext(prevState => ({
          ...prevState,
          user: null,
          userData: null,
        }));
      })
      .catch((e: Error) => {
        console.error(e.message);
      })
      .finally(() => navigate('/'));
  }

  return(
    <div className="w-82 p-5 min-h-screen bg-orange-200 overflow-hidden">
   
        <div className= "flex w-60 items-center justify-center">
          <img  src="Logo.png" alt="Logo"  />
        </div>

        {userData ?
        (<nav className="flex flex-col">
         <div className="flex-1 min-h-[150px] mb-3" >
            <p>Members:</p>
            <Members />
         </div>
         <div className="flex-1 overflow-y-auto min-h-[330px] ">
           <BoardsNav />
         </div>
         <div className="border-t pt-3">
          <div>
            <img />
            <button className="btn-primary-hover">Profile</button>
          </div>
          <div>
            <button className="btn-primary-hover" onClick={onLogout}>Logout</button>
          </div>
         </div>
        </nav>)
         : <NavButtons links = {LinksUserOptions} /> 
         }
      </div>
  )
}

export default SideBar;