import { useEffect, useState } from 'react'
import type { CardProps, UserData } from '../../common/typeScriptDefinitions.ts'
import { getInitials } from '../../common/userUtils.ts'
import { getCardLive } from '../../services/cards.service.ts'
import { getUserByUid } from '../../services/users.service.ts'
import CardDetails from '../CardDetails/CardDetails.tsx'

const CardView = ({ card }: CardProps) => {
    const [memberUids, setMemberUids] = useState<string[]>([])
    const [members, setMembers] = useState<UserData[]>([])

    useEffect(() => {
        return getCardLive(card.id, cardDetails => {
            setMemberUids(cardDetails.members ?? [])
        })
    }, [card.id])

    useEffect(() => {
        let isCurrent = true
        setMembers([])

        if (memberUids.length === 0) {
            return () => { isCurrent = false }
        }

        Promise.all(memberUids.map(getUserByUid))
            .then(users => {
                if (isCurrent) {
                    setMembers(users.filter((user): user is UserData => user !== null))
                }
            })
            .catch(error => console.error('Could not load card members:', error))

        return () => { isCurrent = false }
    }, [memberUids])

    return (
        <div>
            <div className="card min-w-40 bg-base-100 card-xs shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{card.title}</h2>
                    {members.length > 0 && (
                        <ul className="flex max-w-full flex-nowrap items-center -space-x-2 overflow-visible" aria-label="Card members">
                            {members.map(member => (
                                <li
                                    key={member.uid}
                                    className="avatar relative shrink-0 rounded-full ring-2 ring-base-100"
                                    title={`${member.firstName} ${member.lastName}`}
                                    aria-label={`${member.firstName} ${member.lastName}`}
                                >
                                    <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-amber-200 text-[10px] font-semibold text-amber-950">
                                        {member.profilePhoto ? (
                                            <img src={member.profilePhoto} alt="" className="h-full w-full object-cover" />
                                        ) : getInitials(member)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <CardDetails cardId={card.id} initialCard={card}/>
                </div>
            </div>
        </div>
    )
}

export default CardView
