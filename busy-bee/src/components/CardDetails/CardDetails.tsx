import { useContext, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { CardDetails as CardDetailsType, CardDetailsProps, UserData } from '../../common/typeScriptDefinitions.ts';
import { getInitials } from '../../common/userUtils.ts';
import {
  addCardComment,
  addCardChecklistItem,
  getCardLive,
  removeCardChecklistItem,
  updateCardChecklistItem,
  updateCardContent,
  updateCardDeadline,
  updateCardLabels,
  updateCardMembers,
} from '../../services/cards.service.ts';
import { getBoardById, getBoardMembersLive } from '../../services/boards.service.ts';
import { getUserByHandle, getUserByUid } from '../../services/users.service.ts';
import { CARD_LABELS, getCardLabelColor } from '../../common/cardLabels.ts';
import UserSearchDropdown from '../UserSearchDropdown/UserSearchDropdown';
import { FaCheck, FaRegEdit } from 'react-icons/fa';
import AppContext from '../../context/AppContext';

const toLocalDateTimeValue = (dateValue?: string): string => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const CardDetails = ({ cardId, initialCard }: CardDetailsProps) => {
  const { userData } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetailsType>(initialCard);
  const [boardMembers, setBoardMembers] = useState<UserData[]>([]);
  const [isLoadingBoardMembers, setIsLoadingBoardMembers] = useState(true);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [isLabelPickerOpen, setIsLabelPickerOpen] = useState(false);
  const [isSavingLabels, setIsSavingLabels] = useState(false);
  const [labelError, setLabelError] = useState('');
  const [cardName, setCardName] = useState(initialCard.title);
  const [isEditingName, setIsEditingName] = useState(false);
  const [cardDescription, setCardDescription] = useState(initialCard.discription ?? '');
  const [isEditingDescription, setIsEditingDescription] = useState(!initialCard.discription);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [isDeadlineEditorOpen, setIsDeadlineEditorOpen] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState(toLocalDateTimeValue(initialCard.deadline));
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);
  const [deadlineError, setDeadlineError] = useState('');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isSavingChecklist, setIsSavingChecklist] = useState(false);
  const [checklistError, setChecklistError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const checklistSectionRef = useRef<HTMLElement>(null);
  const checklistInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = getCardLive(cardId, (data: CardDetailsType) => {
      setCardDetails(data);
    });

    return () => unsubscribe();
  }, [cardId]);

  useEffect(() => {
    if (!isChecklistOpen) return;
    checklistSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    checklistInputRef.current?.focus({ preventScroll: true });
  }, [isChecklistOpen]);

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
  const selectedLabels = cardDetails.labels ?? [];
  const checklistItems = Object.entries(cardDetails.checklistItems ?? {});
  const comments = Object.entries(cardDetails.comments ?? {}).sort(
    ([, first], [, second]) => first.createdAt - second.createdAt
  );
  const deadlineDate = cardDetails.deadline ? new Date(cardDetails.deadline) : null;
  const deadlineText = deadlineDate && !Number.isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    : '';

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || !userData || isSavingComment) return;

    setIsSavingComment(true);
    setCommentError('');
    try {
      await addCardComment(cardId, userData.uid, text);
      setCommentText('');
    } catch (error) {
      console.error('Could not add the card comment:', error);
      setCommentError('Could not send your comment. Please try again.');
    } finally {
      setIsSavingComment(false);
    }
  };

  const saveDeadline = async () => {
    if (isSavingDeadline) return;

    const previousDeadline = cardDetails.deadline;
    const updatedDeadline = deadlineInput ? new Date(deadlineInput).toISOString() : '';
    setIsSavingDeadline(true);
    setDeadlineError('');
    setCardDetails(current => ({ ...current, deadline: updatedDeadline || undefined }));

    try {
      await updateCardDeadline(cardId, updatedDeadline);
      setIsDeadlineEditorOpen(false);
    } catch (error) {
      console.error('Could not save the card deadline:', error);
      setCardDetails(current => ({ ...current, deadline: previousDeadline }));
      setDeadlineInput(toLocalDateTimeValue(previousDeadline));
      setDeadlineError('Could not save the deadline. Please try again.');
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const addChecklistItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = newChecklistItem.trim();
    if (!text || isSavingChecklist) return;

    setIsSavingChecklist(true);
    setChecklistError('');
    try {
      await addCardChecklistItem(cardId, text);
      setNewChecklistItem('');
    } catch (error) {
      console.error('Could not add a checklist item:', error);
      setChecklistError('Could not add this item. Please try again.');
    } finally {
      setIsSavingChecklist(false);
    }
  };

  const setChecklistItemCompleted = async (itemId: string, completed: boolean) => {
    if (isSavingChecklist) return;

    setIsSavingChecklist(true);
    setChecklistError('');
    try {
      await updateCardChecklistItem(cardId, itemId, completed);
    } catch (error) {
      console.error('Could not update a checklist item:', error);
      setChecklistError('Could not update this item. Please try again.');
    } finally {
      setIsSavingChecklist(false);
    }
  };

  const deleteChecklistItem = async (itemId: string) => {
    if (isSavingChecklist) return;

    setIsSavingChecklist(true);
    setChecklistError('');
    try {
      await removeCardChecklistItem(cardId, itemId);
    } catch (error) {
      console.error('Could not remove a checklist item:', error);
      setChecklistError('Could not remove this item. Please try again.');
    } finally {
      setIsSavingChecklist(false);
    }
  };

  const saveLabels = (updatedLabels: string[]) => {
    if (isSavingLabels) return;

    const previousLabels = selectedLabels;
    setIsSavingLabels(true);
    setLabelError('');
    setCardDetails(current => ({ ...current, labels: updatedLabels }));

    updateCardLabels(cardId, updatedLabels)
      .catch(error => {
        console.error('Could not update card labels:', error);
        setCardDetails(current => ({ ...current, labels: previousLabels }));
        setLabelError('Could not update labels. Please try again.');
      })
      .finally(() => setIsSavingLabels(false));
  };

  const toggleCardLabel = (label: string) => {
    const updatedLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(selectedLabel => selectedLabel !== label)
      : [...selectedLabels, label];
    saveLabels(updatedLabels);
  };

  const saveCardName = () => {
    const updatedTitle = cardName.trim();
    if (!updatedTitle) {
      setDetailsError('Card name cannot be empty.');
      return;
    }
    if (isSavingDetails) return;

    const previousTitle = cardDetails.title;
    setIsSavingDetails(true);
    setDetailsError('');
    setCardDetails(current => ({ ...current, title: updatedTitle }));

    updateCardContent(cardId, updatedTitle, cardDetails.discription ?? '')
      .then(() => setIsEditingName(false))
      .catch(error => {
        console.error('Could not save the card name:', error);
        setCardDetails(current => ({ ...current, title: previousTitle }));
        setDetailsError('Could not save the card name. Please try again.');
      })
      .finally(() => setIsSavingDetails(false));
  };

  const saveCardDescription = () => {
    if (isSavingDetails) return;

    const previousDescription = cardDetails.discription ?? '';
    const updatedDescription = cardDescription.trim();
    setIsSavingDetails(true);
    setDetailsError('');
    setCardDetails(current => ({ ...current, discription: updatedDescription }));

    updateCardContent(cardId, cardDetails.title, updatedDescription)
      .then(() => setIsEditingDescription(!updatedDescription))
      .catch(error => {
        console.error('Could not save the card description:', error);
        setCardDetails(current => ({ ...current, discription: previousDescription }));
        setDetailsError('Could not save the description. Please try again.');
      })
      .finally(() => setIsSavingDetails(false));
  };

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

  const removeCardMember = (member: UserData) => {
    if (isSavingMember || !assignedMemberUids.includes(member.uid)) return;

    const updatedMemberUids = assignedMemberUids.filter(uid => uid !== member.uid);
    setIsSavingMember(true);
    setMemberError('');
    setCardDetails(current => ({ ...current, members: updatedMemberUids }));

    updateCardMembers(cardId, updatedMemberUids)
      .catch(error => {
        console.error('Could not remove the card member:', error);
        setCardDetails(current => ({ ...current, members: assignedMemberUids }));
        setMemberError('Could not remove this member. Please try again.');
      })
      .finally(() => setIsSavingMember(false));
  };

  return (
    <div>
      <button
        className="btn-primary-hover"
        onClick={() => {
          setCardName(cardDetails.title);
          setCardDescription(cardDetails.discription ?? '');
          setIsEditingDescription(!cardDetails.discription);
          setIsEditingName(false);
          setDetailsError('');
          setOpen(true);
        }}
      >
        More details
      </button>
      {open && (
        <div className="modal modal-open">
          <div className="modal-box max-h-[90vh] w-11/12 max-w-5xl overflow-y-auto">
            {isEditingName ? (
              <div>
                <label htmlFor={`card-name-${cardId}`} className="mb-2 block font-medium">Card name</label>
                <div className="flex items-center gap-2">
                  <input
                    id={`card-name-${cardId}`}
                    type="text"
                    className="input input-warning min-w-0 flex-1 text-lg font-bold"
                    value={cardName}
                    onChange={event => setCardName(event.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-600"
                    onClick={saveCardName}
                    disabled={isSavingDetails}
                    aria-label="Save card name"
                    title="Save card name"
                  >
                    <FaCheck />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-600"
                    onClick={() => {
                      setCardName(cardDetails.title);
                      setDetailsError('');
                      setIsEditingName(false);
                    }}
                    disabled={isSavingDetails}
                    aria-label="Cancel card name changes"
                    title="Cancel changes"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="min-w-0 flex-1 break-words text-xl font-bold">{cardDetails.title}</h3>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-600"
                  onClick={() => {
                    setCardName(cardDetails.title);
                    setDetailsError('');
                    setIsEditingName(true);
                  }}
                  aria-label="Edit card name"
                  title="Edit card name"
                >
                  <FaRegEdit />
                </button>
              </div>
            )}
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
                      <button
                        type="button"
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs leading-none transition-colors hover:bg-yellow-500 focus-visible:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-600"
                        onClick={() => removeCardMember(member)}
                        disabled={isSavingMember}
                        aria-label={`Remove ${member.firstName} ${member.lastName} from this card`}
                        title="Remove from card"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {memberError && <p className="mt-2 text-sm text-error">{memberError}</p>}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
              <div>
                {deadlineText && (
                  <p className="mb-3 text-sm opacity-80">
                    <span className="font-medium">Deadline:</span> {deadlineText}
                  </p>
                )}
                <label htmlFor={`card-description-${cardId}`} className="mb-2 block font-medium">Description</label>
                {cardDetails.discription && !isEditingDescription ? (
                  <button
                    type="button"
                    className="w-full whitespace-pre-wrap rounded p-2 text-left text-sm hover:bg-base-200/60"
                    onClick={() => {
                      setCardDescription(cardDetails.discription ?? '');
                      setIsEditingDescription(true);
                    }}
                    aria-label="Edit card description"
                    title="Click to edit description"
                  >
                    {cardDetails.discription}
                  </button>
                ) : (
                  <textarea
                    id={`card-description-${cardId}`}
                    placeholder="Write description ..."
                    className="textarea textarea-warning w-full"
                    value={cardDescription}
                    onChange={event => setCardDescription(event.target.value)}
                  />
                )}
                {selectedLabels.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Labels</p>
                    <ul className="flex flex-wrap gap-2">
                      {selectedLabels.map(label => (
                        <li key={label} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-white ${getCardLabelColor(label)}`}>
                          <span>{label}</span>
                          <button
                            type="button"
                            className="flex h-4 w-4 items-center justify-center rounded-full text-xs leading-none transition-colors hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                            onClick={() => toggleCardLabel(label)}
                            disabled={isSavingLabels}
                            aria-label={`Remove ${label} label`}
                            title={`Remove ${label} label`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {labelError && <p className="mt-2 text-sm text-error">{labelError}</p>}
                {isChecklistOpen && (
                  <section id={`card-checklist-${cardId}`} ref={checklistSectionRef} className="mt-5 rounded-box bg-base-200 p-3" aria-labelledby={`checklist-title-${cardId}`}>
                    <h4 id={`checklist-title-${cardId}`} className="mb-3 font-semibold">Checklist</h4>
                    {checklistItems.length > 0 ? (
                      <ul className="flex flex-col gap-2">
                        {checklistItems.map(([itemId, item]) => (
                          <li key={itemId} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-warning checkbox-sm"
                              checked={item.completed}
                              onChange={event => void setChecklistItemCompleted(itemId, event.target.checked)}
                              disabled={isSavingChecklist}
                              aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}
                            />
                            <span className={`min-w-0 flex-1 break-words text-sm ${item.completed ? 'text-base-content/60 line-through' : ''}`}>
                              {item.text}
                            </span>
                            <button
                              type="button"
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm leading-none transition-colors hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-600"
                              onClick={() => void deleteChecklistItem(itemId)}
                              disabled={isSavingChecklist}
                              aria-label={`Delete checklist item ${item.text}`}
                              title="Delete item"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-3 text-sm opacity-70">No items yet. Add the first one below.</p>
                    )}

                    <form className="mt-3 flex gap-2" onSubmit={addChecklistItem}>
                      <input
                        ref={checklistInputRef}
                        type="text"
                        className="input input-warning input-sm min-w-0 flex-1"
                        value={newChecklistItem}
                        onChange={event => setNewChecklistItem(event.target.value)}
                        placeholder="Add a checklist item"
                        aria-label="New checklist item"
                      />
                      <button type="submit" className="btn-primary" disabled={isSavingChecklist || !newChecklistItem.trim()}>
                        Add item
                      </button>
                    </form>
                    {checklistError && <p className="mt-2 text-sm text-error" role="alert">{checklistError}</p>}
                  </section>
                )}
              </div>

              <div className="flex flex-col items-start gap-2">
                <button
                  type="button"
                  className="btn-primary-hover"
                  onClick={() => setIsLabelPickerOpen(current => !current)}
                  aria-expanded={isLabelPickerOpen}
                  aria-controls={`card-label-options-${cardId}`}
                >
                  Label
                </button>
                {isLabelPickerOpen && (
                  <ul id={`card-label-options-${cardId}`} className="mt-2 flex flex-col gap-1 rounded-box bg-base-200 p-2">
                    {CARD_LABELS.map(label => {
                      const isSelected = selectedLabels.includes(label.name);
                      return (
                        <li key={label.name}>
                          <button
                            type="button"
                            className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-base-300 ${isSelected ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => toggleCardLabel(label.name)}
                            disabled={isSavingLabels}
                            aria-pressed={isSelected}
                          >
                            <span className={`h-4 w-8 rounded ${label.colorClass}`} aria-hidden="true" />
                            {label.name}
                            {isSelected && <span className="ml-auto">✓</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <button
                  type="button"
                  className="btn-primary-hover"
                  onClick={() => {
                    setDeadlineInput(toLocalDateTimeValue(cardDetails.deadline));
                    setDeadlineError('');
                    setIsDeadlineEditorOpen(current => !current);
                  }}
                  aria-expanded={isDeadlineEditorOpen}
                  aria-controls={`card-deadline-editor-${cardId}`}
                >
                  Date &amp; time
                </button>
                {isDeadlineEditorOpen && (
                  <div id={`card-deadline-editor-${cardId}`} className="w-full rounded-box bg-base-200 p-3">
                    <label htmlFor={`card-deadline-${cardId}`} className="mb-2 block text-sm font-medium">Deadline</label>
                    <input
                      id={`card-deadline-${cardId}`}
                      type="datetime-local"
                      className="input input-warning min-h-12 w-full min-w-0 text-base"
                      value={deadlineInput}
                      onChange={event => setDeadlineInput(event.target.value)}
                    />
                    <button type="button" className="btn-primary mt-3" onClick={() => void saveDeadline()} disabled={isSavingDeadline}>
                      {isSavingDeadline ? 'Saving…' : 'Save deadline'}
                    </button>
                    {deadlineError && <p className="mt-2 text-sm text-error" role="alert">{deadlineError}</p>}
                  </div>
                )}

                <button
                  type="button"
                  className="btn-primary-hover"
                  onClick={() => setIsChecklistOpen(true)}
                  aria-expanded={isChecklistOpen}
                  aria-controls={`card-checklist-${cardId}`}
                >
                  Checklist
                </button>
              </div>
            </div>

            <section className="mt-6 border-t border-base-300 pt-4" aria-labelledby={`card-comments-title-${cardId}`}>
              <h4 id={`card-comments-title-${cardId}`} className="font-semibold">Comments</h4>
              <div className="custom-scroll mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto pr-2" aria-live="polite">
                {comments.length === 0 ? (
                  <p className="text-sm opacity-70">No comments yet.</p>
                ) : comments.map(([commentId, comment]) => {
                  const isCurrentUser = comment.uid === userData?.uid;
                  return (
                    <div key={commentId} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <article className={`max-w-[85%] rounded-box px-3 py-2 ${isCurrentUser ? 'bg-amber-200 text-amber-950' : 'bg-base-200'}`}>
                        <p className="whitespace-pre-wrap break-words text-sm">{comment.text}</p>
                        <time className="mt-1 block text-right text-[10px] opacity-70" dateTime={new Date(comment.createdAt).toISOString()}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </time>
                      </article>
                    </div>
                  );
                })}
              </div>
              <form className="mt-3 flex items-end gap-2" onSubmit={submitComment}>
                <textarea
                  className="textarea textarea-warning min-h-12 min-w-0 flex-1"
                  rows={2}
                  value={commentText}
                  onChange={event => setCommentText(event.target.value)}
                  placeholder="Write a comment…"
                  aria-label="Write a comment"
                />
                <button type="submit" className="btn-primary" disabled={!userData || isSavingComment || !commentText.trim()}>
                  {isSavingComment ? 'Sending…' : 'Send'}
                </button>
              </form>
              {commentError && <p className="mt-2 text-sm text-error" role="alert">{commentError}</p>}
            </section>

            <div className="modal-action">
              {detailsError && <p className="mr-auto text-sm text-error">{detailsError}</p>}
              <button className="btn-primary" onClick={saveCardDescription} disabled={isSavingDetails}>
                {isSavingDetails ? 'Saving…' : 'Save'}
              </button>
              <button className="btn-primary" onClick={() => setOpen(false)} disabled={isSavingDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDetails;
