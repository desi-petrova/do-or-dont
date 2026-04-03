import { useState, useContext, useEffect } from 'react'
import type {CardProps} from '../../common/typeScriptDefinitions.ts'



const CardView = ({ card }: CardProps) =>{


    return (
        <div>
            <div className="card w-96 bg-base-100 card-xs shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{card.title}</h2>
                    <div className="justify-end card-actions">
                    <button className="btn-primary">More Detail</button>
                    </div>
                </div>
                </div>
        </div>
    )
} 

export default CardView;