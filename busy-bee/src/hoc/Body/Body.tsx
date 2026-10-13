import type { ReactNode, FC } from 'react';
import { FiLoader } from 'react-icons/fi';
import SideBar from "../../components/SideBar/SideBar"

interface BodyProps {
  children: ReactNode;
  loading: boolean;
}

const Body: FC<BodyProps> = ({ children, loading }) => {
 

  return (
  <div className="drawer lg:drawer-open">
  <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content bg-amber-50 base-300 flex flex-col w-full h-screen overflow-hidden">
    {loading ? (
      <main
        className="flex flex-1 flex-col items-center justify-center gap-3"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading"
      >
        <FiLoader className="h-8 w-8 animate-spin text-amber-700" aria-hidden="true" />
        <p className="text-base font-medium text-amber-900">Loading…</p>
      </main>
    ) : children}
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
    {loading ? (
      <aside className="h-screen w-75 bg-orange-200" aria-hidden="true" />
    ) : <SideBar />}
  </div>
</div>
  )
}

export default Body;
