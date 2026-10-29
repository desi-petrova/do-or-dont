import { useState, useContext, useEffect } from 'react'
import type {CardProps} from '../../common/typeScriptDefinitions.ts'
import CardDetails from '../CardDetails/CardDetails.tsx';



const CardView = ({ card }: CardProps) =>{


    return (
        <div>
            <div className="card min-w-40  bg-base-100 card-xs shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{card.title}</h2>
                    <CardDetails cardId={card.id} initialCard={card}/>
                </div>
            </div>
        </div>
    )
} 

export default CardView;