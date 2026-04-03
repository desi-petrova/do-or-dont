import { useState, useContext, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import ListView from '../ListView/ListView'
import {getBoardListsLive, getBoardTitleLive } from '../../services/boards.service.ts'
import {getListById } from '../../services/lists.service.ts'
import type {List} from '../../common/typeScriptDefinitions.ts'
import { useParams } from "react-router-dom"
import CreateNewList from '../CleateNewList/CleateNewList.tsx';


const BoardView = () => {

    const [lists, setLists] = useState<List[]>([])
    const [boardTitle, setBoardTitle] = useState<string>("")
    const { idBoard } = useParams()

     useEffect(() => {
        if(idBoard === undefined) return;

        const unsubscribe = getBoardListsLive (idBoard, ((data: string[]) => {
            Promise.all(
                data.map((listId: string) => {
                return getListById(listId)
            }))
            .then(listValue => setLists([...listValue]))
            .catch(e => console.error(e));
        }))
        return () => unsubscribe(); 
      }, [idBoard])

      useEffect(() => {
        if(idBoard === undefined) return;

        const unsubscribe = getBoardTitleLive (idBoard, ((data: string) => {
         setBoardTitle(data)

        }))
        return () => unsubscribe(); 
      }, [idBoard])

      if (!idBoard) return "Board is not find"

    return (
        <div className="flex flex-col h-screen">
            <h2 className="text-2xl font-semibold p-4 shrink-0">
                {boardTitle}
            </h2>
            <div className="flex gap-6 overflow-x-auto overflow-y-hidden px-4 pb-4 flex-1 custom-scroll">
                {lists.length > 0 && lists.map(list => (
                <div key={list.id} className="min-w-55 h-full shrink-0">
                    <ListView list={list} />
                </div>
                ))}
                <div className="min-w-55 h-full shrink-0">
                <CreateNewList idBoard={idBoard} />
                </div>
            </div>
            </div>
    )
}

export default BoardView;