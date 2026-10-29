import { useEffect, useState } from 'react';
import type { CardDetails as CardDetailsType, CardDetailsProps, UserData } from '../../common/typeScriptDefinitions.ts';
import { getInitials } from '../../common/userUtils.ts';
import { getCardLive, updateCardMembers } from '../../services/cards.service.ts';
import { getBoardById, getBoardMembersLive } from '../../services/boards.service.ts';
import { getUserByHandle, getUserByUid } from '../../services/users.service.ts';
import UserSearchDropdown from '../UserSearchDropdown/UserSearchDropdown';

const CardDetails = ({ cardId, initialCard }: CardDetailsProps) => {
  const [open, setOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetailsType>(initialCard);
  const [boardMembers, setBoardMembers] = useState<UserData[]>([]);
  const [isLoadingBoardMembers, setIsLoadingBoardMembers] = useState(true);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    const unsubscribe = getCardLive(cardId, (data: CardDetailsType) => {
      setCardDetails(data);
    });

    return () => unsubscribe();
  }, [cardId]);

  useEffect(() => {
    let isCurrent = true;
    let requestVersion = 0;
    let memberUids: string[] = [];

    if (!open) {
      setIsLoadingBoardMembers(false);
      return () => { isCurrent = false; };
    }

    setBoardMembers([]);
    setIsLoadingBoardMembers(true);
    setMemberError('');

    const ownerProfilePromise = getBoardById(initialCard.boardId)
      .then(async board => {
        if (!board) return null;
        const snapshot = await getUserByHandle(board.owner);
        return snapshot.exists() ? snapshot.val() as UserData : null;
      })
      .catch(error => {
        console.error('Could not load the board owner:', error);
        return null;
      });

    const loadBoardUsers = async () => {
      const currentRequest = ++requestVersion;
      try {
        const [owner, ...users] = await Promise.all([
          ownerProfilePromise,
          ...memberUids.map(getUserByUid),
        ]);
        if (!isCurrent || currentRequest !== requestVersion) return;

        const usersByUid = new Map<string, UserData>();
        if (owner) usersByUid.set(owner.uid, owner);
        users.forEach(user => {
          if (user) usersByUid.set(user.uid, user);
        });
        setBoardMembers(Array.from(usersByUid.values()));
      } catch (error) {
        if (isCurrent) {
          console.error('Could not load board members:', error);
          setMemberError('Could not load board members.');
        }
      } finally {
        if (isCurrent && currentRequest === requestVersion) {
          setIsLoadingBoardMembers(false);
        }
      }
    };

    const unsubscribe = getBoardMembersLive(initialCard.boardId, memberIds => {
      memberUids = memberIds;
      void loadBoardUsers();
    });

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [initialCard.boardId, open]);

  const assignedMemberUids = cardDetails.members ?? [];
  const assignedMembers = boardMembers.filter(member => assignedMemberUids.includes(member.uid));
  const availableMembers = boardMembers.filter(member => !assignedMemberUids.includes(member.uid));

  const addCardMember = (member: UserData) => {
    if (isSavingMember || assignedMemberUids.includes(member.uid)) return;

    const updatedMemberUids = [...assignedMemberUids, member.uid];
    setIsSavingMember(true);
    setMemberError('');
    setCardDetails(current => ({ ...current, members: updatedMemberUids }));

    updateCardMembers(cardId, updatedMemberUids)
      .catch(error => {
        console.error('Could not add the card member:', error);
        setCardDetails(current => ({
          ...current,
          members: (current.members ?? []).filter(uid => uid !== member.uid),
        }));
        setMemberError('Could not add this member. Please try again.');
      })
      .finally(() => setIsSavingMember(false));
  };

  return (
    <div>
      <button className="btn-primary-hover" onClick={() => setOpen(true)}>
        More details
      </button>
      {open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{cardDetails.title}</h3>
            <div className="mt-4">
              <label className="mb-2 block font-medium">Members</label>
              {isLoadingBoardMembers ? (
                <p className="text-sm opacity-70">Loading board members…</p>
              ) : (
                <UserSearchDropdown
                  users={availableMembers}
                  onSelect={addCardMember}
                  placeholder={isSavingMember ? 'Saving member…' : 'Add a board member'}
                />
              )}

              {assignedMembers.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-3">
                  {assignedMembers.map(member => (
                    <li key={member.uid} className="flex items-center gap-2">
                      <span className="avatar shrink-0">
                        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-200 text-xs font-semibold text-amber-950">
                          {member.profilePhoto ? (
                            <img src={member.profilePhoto} alt="" className="h-full w-full object-cover" />
                          ) : getInitials(member)}
                        </span>
                      </span>
                      <span className="text-sm">{member.firstName} {member.lastName}</span>
                    </li>
                  ))}
                </ul>
              )}
              {memberError && <p className="mt-2 text-sm text-error">{memberError}</p>}
            </div>

            <textarea placeholder="Write description ..." className="textarea textarea-warning mt-4 w-full" />

            <div className="modal-action">
              <button className="btn-primary" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDetails;
