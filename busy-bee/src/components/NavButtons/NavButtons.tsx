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
       className='btn-primary'
       onClick= {() => navigate(link.path)}>{link.name}</button>
       ))}
    </div>
    )
}

export default NavButtons;
