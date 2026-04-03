import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import { logoutUser } from '../../services/auth.service';
import NavButtons from '../NavButtons/NavButtons';
import Members from '../Members/Members';
import BoardsNav from '../BoardsNav/BoardsNav';
import CreateNewBoard from '../CreateNewBoard/CreateNewBoard';
import { FiLogOut } from "react-icons/fi";


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
    <div className="w-75 h-screen bg-orange-200 flex flex-col overflow-hidden">
      <div className="flex w-60 items-center justify-center p-4 shrink-0">
        <img src="Logo.png" alt="Logo" />
      </div>
      {userData ? (
        <nav className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col min-h-30 mb-3">
            <p className="px-4 shrink-0">Members:</p>
            <div className="overflow-y-auto custom-scroll px-4">
              <Members />
            </div>
          </div>
          <div className="flex flex-col flex-1 min-h-0">
             <div className="flex items-center justify-between px-4">
                <h4 className="text-lg font-semibold">Boards:</h4>
                <CreateNewBoard />
            </div>  
            <div className="overflow-y-auto custom-scroll px-4">
              <BoardsNav />
            </div>
          </div>

          <div className="border-t p-4 shrink-0">
            <div className="flex justify-between items-center">
              <button className="btn-primary-hover">Profile</button>
              <button className="btn-primary-hover" onClick={onLogout}>
                <FiLogOut />
              </button>
              </div>
          </div>
        </nav>
      ) : (
        <NavButtons links={LinksUserOptions} />
      )}
    </div>
  )
}

export default SideBar;