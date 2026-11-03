import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import AppContext from '../../context/AppContext';
import { getInitials } from '../../common/userUtils.ts';
import { updateUserProfile } from '../../services/users.service.ts';

const Profile = () => {
  const { userData, setContext } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!userData) return null;

  const openProfile = () => {
    setFirstName(userData.firstName);
    setLastName(userData.lastName);
    setErrorMessage('');
    setIsOpen(true);
  };

  const saveProfile = async () => {
    const updatedFirstName = firstName.trim();
    const updatedLastName = lastName.trim();
    if (!updatedFirstName || !updatedLastName) {
      setErrorMessage('First name and last name are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      await updateUserProfile(userData.handle, updatedFirstName, updatedLastName);
      setContext(current => ({
        ...current,
        userData: {
          ...userData,
          firstName: updatedFirstName,
          lastName: updatedLastName,
        },
      }));
      setFirstName(updatedFirstName);
      setLastName(updatedLastName);
    } catch (error) {
      console.error('Could not save the user profile:', error);
      setErrorMessage('Could not save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button type="button" className="btn-primary-hover" onClick={openProfile}>
        Profile
      </button>

      {isOpen && createPortal(
        <div className="modal modal-open" role="presentation">
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <h2 id="profile-title" className="mb-5 text-xl font-bold">Your profile</h2>
            <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(0,1fr)]">
              <div className="flex justify-center">
                <div className="avatar">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-amber-300 text-3xl font-semibold text-amber-950">
                    {userData.profilePhoto ? (
                      <img
                        src={userData.profilePhoto}
                        alt={`${userData.firstName} ${userData.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : getInitials(userData)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="form-control w-full">
                  <span className="label-text mb-1">First name</span>
                  <input
                    type="text"
                    className="input input-warning w-full"
                    value={firstName}
                    onChange={event => setFirstName(event.target.value)}
                    autoComplete="given-name"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text mb-1">Last name</span>
                  <input
                    type="text"
                    className="input input-warning w-full"
                    value={lastName}
                    onChange={event => setLastName(event.target.value)}
                    autoComplete="family-name"
                  />
                </label>
                <div className="form-control w-full">
                  <span className="label-text mb-1">Email</span>
                  <p className="break-all py-2 text-base-content">{userData.email}</p>
                </div>
              </div>
            </div>

            {errorMessage && <p className="mt-4 text-sm text-error" role="alert">{errorMessage}</p>}

            <div className="modal-action">
              <button type="button" className="btn-primary" onClick={saveProfile} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn-primary" onClick={() => setIsOpen(false)} disabled={isSaving}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Profile;
