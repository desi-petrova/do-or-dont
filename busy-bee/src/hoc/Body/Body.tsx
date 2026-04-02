import type { ReactNode, FC } from 'react';
import SideBar from "../../components/SideBar/SideBar"

interface BodyProps {
  children: ReactNode;
}

const Body: FC<BodyProps> = ({ children }) => {
 

  return (
  <div className="drawer lg:drawer-open">
  <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content flex flex-col w-full h-screen overflow-hidden">
    {children}
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
    <SideBar />
  </div>
</div>
  )
}

export default Body;