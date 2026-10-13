import { useNavigate } from 'react-router-dom';
import type { NavLinksProps } from '../../common/typeScriptDefinitions.ts';

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
