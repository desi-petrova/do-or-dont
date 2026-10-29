import { useId, useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import type { UserData, UserSearchDropdownProps } from '../../common/typeScriptDefinitions.ts';
import { getInitials } from '../../common/userUtils.ts';

const UserSearchDropdown = ({
  users,
  onSelect,
  placeholder = 'Search users...',
}: UserSearchDropdownProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const matchingUsers = users.filter(user =>
    [user.firstName, user.lastName, user.handle, user.email]
      .some(value => value.toLowerCase().includes(normalizedSearchTerm))
  );

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }

    if (event.key === 'Enter' && isOpen && matchingUsers[0]) {
      event.preventDefault();
      onSelect(matchingUsers[0]);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const selectUser = (user: UserData) => {
    onSelect(user);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" onBlur={handleBlur}>
      <input
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label="Search users by name, handle, or email"
        placeholder={placeholder}
        value={searchTerm}
        className="input input-bordered input-sm w-full"
        onFocus={() => setIsOpen(true)}
        onChange={event => {
          setSearchTerm(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-x-hidden rounded-box bg-base-100 p-1 shadow-lg"
          style={{
            maxHeight: 'min(16rem, 45vh)',
            overflowY: 'auto',
            overscrollBehaviorY: 'contain',
          }}
        >
          {matchingUsers.length > 0 ? matchingUsers.map(user => {
            const fullName = `${user.firstName} ${user.lastName}`.trim();

            return (
              <li key={user.uid} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-label={`${fullName}, ${user.email}`}
                  aria-selected="false"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-base-200 focus:bg-base-200"
                  onClick={() => selectUser(user)}
                >
                  <span className="avatar shrink-0">
                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-amber-200 text-sm font-semibold text-amber-950">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
                      ) : getInitials(user)}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{fullName}</span>
                    <span className="block truncate text-sm opacity-70">{user.email}</span>
                  </span>
                </button>
              </li>
            );
          }) : (
            <li className="px-3 py-2 text-sm opacity-70" role="option" aria-selected="false">
              {users.length === 0 ? 'No users available.' : 'No users found.'}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default UserSearchDropdown;
