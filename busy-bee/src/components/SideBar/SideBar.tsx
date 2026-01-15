import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import { logoutUser } from '../../services/auth.service';
import NavButtons from '../NavButtons/NavButtons';


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

  return(
    <div className="w-82 p-5 min-h-screen bg-orange-200">
   
        <div className= "flex w-60 items-center justify-center">
          <img  src="Logo.png" alt="Logo"  />
        </div>

        {userData ?
        (<nav className="flex ">
          <a className="block p-2 rounded hover:bg-gray-700" href="#">
            Item 1
          </a>
          <a className="block p-2 rounded hover:bg-gray-700" href="#">
            Item 2
          </a>
          <a className="block p-2 rounded hover:bg-gray-700" href="#">
            Item 3
          </a>
        </nav>)
         : <NavButtons links = {LinksUserOptions} /> 
         }
      </div>
  )
}

export default SideBar;