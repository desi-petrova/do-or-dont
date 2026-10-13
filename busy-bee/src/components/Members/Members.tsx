import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import type { UserData } from '../../common/typeScriptDefinitions.ts';
import { addBoardMembers, getBoardById, getBoardMembersLive } from '../../services/boards.service.ts';
import { getAllUsers, getUserData, getUserByHandle } from '../../services/users.service.ts';
import UserSearchDropdown from '../UserSearchDropdown/UserSearchDropdown';

const getInitials = (user: UserData) =>
  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

const Members = () => {
  const location = useLocation();
  const { userData } = useContext(AppContext);
  const routeSegments = location.pathname.split('/').filter(Boolean);
  const stateBoardId = (location.state as { idBoard?: string } | null)?.idBoard;
  const boardId = routeSegments[0] === 'boardView'
    ? routeSegments[1] ?? stateBoardId
    : undefined;

  const [memberUids, setMemberUids] = useState<string[]>([]);
  const [memberUsers, setMemberUsers] = useState<UserData[]>([]);
  const [boardOwner, setBoardOwner] = useState<UserData | null>(null);
  const [isBoardOwner, setIsBoardOwner] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setMemberUids([]);
    setMemberUsers([]);
    setBoardOwner(null);
    setIsBoardOwner(false);
    setSelectedUsers([]);
    setIsAddDialogOpen(false);
    setErrorMessage('');

    if (!boardId) return () => { isCurrent = false; };

    const unsubscribe = getBoardMembersLive(boardId, setMemberUids);

    getBoardById(boardId)
      .then(board => {
        if (!isCurrent || !board) return;

        setIsBoardOwner(board.owner === userData?.handle);
        return getUserByHandle(board.owner).then(snapshot => {
          if (isCurrent && snapshot.exists()) {
            setBoardOwner(snapshot.val() as UserData);
          }
        });
      })
      .catch(error => {
        console.error('Could not load board details:', error);
      });

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [boardId, userData?.handle]);

  useEffect(() => {
    let isCurrent = true;

    if (memberUids.length === 0) {
      setMemberUsers([]);
      return () => { isCurrent = false; };
    }

    Promise.all(memberUids.map(async uid => {
      const snapshot = await getUserData(uid);
      const users = snapshot.val() as Record<string, UserData> | null;
      return users ? Object.values(users)[0] : null;
    }))
      .then(users => {
        if (isCurrent) {
          setMemberUsers(users.filter((user): user is UserData => user !== null));
        }
      })
      .catch(error => console.error('Could not load board members:', error));

    return () => { isCurrent = false; };
  }, [memberUids]);

  const boardMembers = memberUsers;
  const existingMemberUids = new Set([
    ...memberUids,
    ...(boardOwner ? [boardOwner.uid] : []),
  ]);
  const selectedUserUids = new Set(selectedUsers.map(user => user.uid));
  const availableUsers = allUsers.filter(user =>
    !existingMemberUids.has(user.uid) && !selectedUserUids.has(user.uid)
  );

  const openAddDialog = () => {
    setSelectedUsers([]);
    setErrorMessage('');
    setIsAddDialogOpen(true);

    if (hasLoadedUsers || isLoadingUsers) return;

    setIsLoadingUsers(true);
    getAllUsers()
      .then(users => {
        setAllUsers(users);
        setHasLoadedUsers(true);
      })
      .catch(error => {
        console.error('Could not load users:', error);
        setErrorMessage('Could not load users. Please try again.');
      })
      .finally(() => setIsLoadingUsers(false));
  };

  const saveMembers = () => {
    if (!boardId || selectedUsers.length === 0) return;

    setIsSaving(true);
    setErrorMessage('');
    addBoardMembers(boardId, selectedUsers)
      .then(() => {
        setSelectedUsers([]);
        setIsAddDialogOpen(false);
      })
      .catch(error => {
        console.error('Could not save board members:', error);
        setErrorMessage('Could not save members. Please try again.');
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between px-4">
        <h4 className="text-lg font-semibold">Members:</h4>
        {boardId && isBoardOwner && (
          <button
            type="button"
            className="btn-primary-hover"
            onClick={openAddDialog}
            aria-label="Add members to this board"
            title="Add members"
          >
            +
          </button>
        )}
      </div>

      {!boardId ? (
        <p className="px-4 text-sm opacity-70">Select a board to see its members.</p>
      ) : boardMembers.length === 0 ? (
        <p className="px-4 text-sm opacity-70">No members added to this board</p>
      ) : (
        <ul className="custom-scroll flex max-h-40 flex-col gap-2 overflow-y-auto overscroll-contain px-4">
          {boardMembers.map(member => (
            <li key={member.uid} className="flex min-w-0 items-center gap-2">
              <span className="avatar shrink-0">
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-300 text-xs font-semibold text-amber-950">
                  {member.profilePhoto ? (
                    <img src={member.profilePhoto} alt="" className="h-full w-full object-cover" />
                  ) : getInitials(member)}
                </span>
              </span>
              <span className="truncate text-sm">{member.firstName} {member.lastName}</span>
            </li>
          ))}
        </ul>
      )}

      {isAddDialogOpen && (
        <div className="modal modal-open" role="presentation">
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="add-members-title">
            <h3 id="add-members-title" className="font-bold text-lg">Add board members</h3>
            <div className="mt-4">
              {isLoadingUsers ? (
                <p className="text-sm">Loading users…</p>
              ) : hasLoadedUsers ? (
                <UserSearchDropdown
                  users={availableUsers}
                  onSelect={user => setSelectedUsers(current => [...current, user])}
                  placeholder="Search by name, handle, or email"
                />
              ) : (
                <button type="button" className="btn-primary" onClick={openAddDialog}>
                  Retry loading users
                </button>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <ul className="mt-4 flex max-h-56 flex-col gap-2 overflow-y-auto">
                {selectedUsers.map(user => (
                  <li key={user.uid} className="flex items-center gap-3 rounded bg-base-200 p-2">
                    <span className="avatar shrink-0">
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-amber-200 text-sm font-semibold text-amber-950">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
                        ) : getInitials(user)}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{user.firstName} {user.lastName}</span>
                      <span className="block truncate text-sm opacity-70">{user.email}</span>
                    </span>
                    <button
                      type="button"
                      className="btn-primary-hover"
                      aria-label={`Remove ${user.firstName} ${user.lastName} from new members`}
                      onClick={() => setSelectedUsers(current => current.filter(selected => selected.uid !== user.uid))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {errorMessage && <p className="mt-3 text-sm text-error">{errorMessage}</p>}

            <div className="modal-action">
              <button type="button" className="btn-primary" onClick={saveMembers} disabled={isSaving || selectedUsers.length === 0}>
                {isSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
