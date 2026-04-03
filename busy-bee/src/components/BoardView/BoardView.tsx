import { useState, useContext, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import ListView from '../ListView/ListView'
import {getBoardListsLive } from '../../services/boards.service.ts'
import {getListById } from '../../services/lists.service.ts'
import type {List} from '../../common/typeScriptDefinitions.ts'
import { useParams } from "react-router-dom"
import CreateNewList from '../CleateNewList/CleateNewList.tsx';


const BoardView = () => {

    const [lists, setLists] = useState<List[]>([])
    const { idBoard } = useParams()

     useEffect(() => {
        if(idBoard === undefined) return;

            getBoardListsLive (idBoard, ((data: string[]) => {
            Promise.all(
                data.map((listId: string) => {
                    return getListById(listId)
                }))
            .then(listValue => setLists([...listValue]))
            .catch(e => console.error(e));
        })
    )
      }, [idBoard])

    return (
        <div className="flex gap-6 items-start overflow-x-auto overflow-y-hiddenh-[90vh] p-4">
            {lists.length > 0 && lists.map(list => {
                return (
                    <ListView key={list.id} list={list}/>
                )
            }
            )}
            <div className="min-w-75 shrink-0 h-full ">
                <CreateNewList idBoard={idBoard}/>
            </div>
        </div>
           
       
    )

}

export default BoardView;