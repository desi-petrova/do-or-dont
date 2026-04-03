import type {ListProps, Card} from '../../common/typeScriptDefinitions.ts'
import { useState, useContext, useEffect } from 'react'
import CardView from '../CardView/CardView.tsx'
import CreateNewCard from '../CleateNewCard/CleateNewCard.tsx'
import { getListCardsLive } from '../../services/lists.service.ts'
import { getCardById } from '../../services/cards.service.ts'

const ListView = ({ list }: ListProps) =>{

    const [cards, setCards] = useState<Card[]>([])

    useEffect(() => {
            if(list.id === undefined) return;
    
                getListCardsLive (list.id, ((data: string[]) => {
                Promise.all(
                    data.map((listId: string) => {
                        return getCardById(listId)
                    }))
                .then(listValue => setCards([...listValue]))
                .catch(e => console.error(e));
            })
        )
          }, [list.id])


    return (
        <div className="min-w-62.5 h-full shrink-0">
            <div className="card bg-base-100 shadow-sm h-full flex flex-col">
            <div className="card-body flex flex-col h-full p-4">
                <div className="flex justify-between">
                <h2 className="text-2xl font-bold">{list.name}</h2>
                </div>
                <div className="flex mt-6 justify-end">
                <CreateNewCard idBoard={list.boardId} idList={list.id}/>
                </div>
                <div className="flex flex-col gap-2 mt-4 overflow-y-auto flex-1 pr-1">
                {cards.length > 0 && cards.map(card => {
                    return (
                    <CardView card={card}/>    
                )})
                }
                </div>
            </div>
            </div>
        </div>
    )
} 

export default ListView;