import { useState, useEffect, useContext } from 'react'
import CreateNewBoard from "../CreateNewBoard/CreateNewBoard";
import {getBoardById } from '../../services/boards.service.ts'
import {getUserBoardsLive } from '../../services/users.service.ts'
import AppContext from '../../context/AppContext';
import type { UserState } from '../../context/AppContext';
import type {Board} from '../../common/typeScriptDefinitions.ts'
import { useNavigate } from "react-router-dom"


const BoardsNav = () => {

    const [boards, setBoards] = useState<Board[]>([])
    const { userData } = useContext<UserState>(AppContext);
    const navigate = useNavigate()
    
     useEffect(() => {

        if(userData === null) return;

            getUserBoardsLive (userData.handle, ((data: string[]) => {
            Promise.all(
                data.map((boardId: string) => {
                    return getBoardById(boardId)
                }))
            .then(boardValue => setBoards([...boardValue]))
            .catch(e => console.error(e));
        })
    )
      }, [])
    

    return (
        <div>
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Boards:</h4>
                <CreateNewBoard />
            </div>            
            <div>
                {boards.length > 0 && boards.map(board => {
                    return (
                        
                        <ul  
                        key={board.id} 
                        className="menu menu-md rounded-box w-56"
                       >
                            <li   className="cursor-pointer p-2 rounded hover:bg-orange-300 transition"
                            onClick={() => navigate(`/boardView/${board.id}`)}>{board.title}</li>
                        </ul>                        
                    )
                })}
            </div>
        
        </div>
       
    )

}

export default BoardsNav;