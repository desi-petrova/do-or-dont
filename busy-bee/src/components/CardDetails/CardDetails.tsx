import { useState, useContext, useEffect } from 'react'
import type {CardDetails, CardDetailsProps} from '../../common/typeScriptDefinitions.ts'
import { getCardLive } from '../../services/cards.service.ts';



const CardDetails = ({ cardId, initialCard  }: CardDetailsProps) => {

    const [open, setOpen] = useState(false);
    const [cardDetails, setCardDetails] = useState<CardDetails>(initialCard)
    const [members, setMembers] = useState<[]>([])

     useEffect(() => {
        const unsubscribe = getCardLive(cardId, (data: CardDetails) => {
        setCardDetails(data);
        });

        return () => unsubscribe(); 

    }, [cardId])

    return (
        <div>
            <button
            className="btn-primary-hover"
            onClick={() => setOpen(true) }
             >
            More details
            </button>
            {open && (
                <div className="modal modal-open">
                <div className="modal-box">
                <h3 className="font-bold text-lg">{cardDetails.title}</h3>
                <div className="mt-2.5">
                    {members?.length > 0 && (<div>
                        <label>Members:</label>
                        <div className="avatar avatar-placeholder">
                            <div className="bg-neutral text-neutral-content w-12 rounded-full">
                                <span>SY</span>
                            </div>
                        </div>
                    </div>)}
                    
                    <textarea placeholder="Write description ..." className="textarea textarea-warning"></textarea>

                </div>
                <div className="modal-action"> 
                     <button className="btn-primary" 
                     onClick={() =>
                     (setOpen(false))
                      }
                     >Close</button>
                </div>
                </div>
                </div>
            )

            }
            
            </div>
  );
} 

export default CardDetails;