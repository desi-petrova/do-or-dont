import { useState, useContext, useEffect } from 'react'
import type {CardProps} from '../../common/typeScriptDefinitions.ts'



const CardView = ({ card }: CardProps) =>{


    return (
        <div>
            <div className="card w-96 bg-base-100 shadow-sm">
            <div className="card-body">
                <div className="flex justify-between">
                <h2 className="text-3xl font-bold">{}</h2>
               
                </div>
                <ul className="mt-6 flex flex-col gap-2 text-xs">
                <li>
                
                </li>
                </ul>
                <div className="mt-6">
                <button className="btn btn-primary btn-block">Subscribe</button>
                </div>
            </div>
            </div>
        </div>
    )
} 

export default CardView;