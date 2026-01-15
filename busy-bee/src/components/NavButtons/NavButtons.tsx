import { useNavigate } from 'react-router-dom';
import type {LinksUserOptionsType} from "../SideBar/SideBar"

  interface NavLinksProps {
    links: LinksUserOptionsType[];
  }

const NavButtons = ({ links }: NavLinksProps) => {
    const navigate = useNavigate();
   

    return (
    <div className="flex mt-10 items-center justify-center">
       {links.map((link) => (
       <button key={link.name} 
       className='btn mr-[10px] border-0 bg-yellow-600 text-center text-sm font-semibold text-black
       hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 
       focus-visible:outline-offset-2 focus-visible:outline-yellow-500 '
       onClick= {() => navigate(link.path)}>{link.name}</button>
       ))}
    </div>
    )
}

export default NavButtons;
