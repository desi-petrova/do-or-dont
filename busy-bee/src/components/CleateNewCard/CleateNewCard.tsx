import { useState,useContext, useRef } from 'react'
import type {NewCard, FormNewCardError, CreateNewCardProps} from '../../common/typeScriptDefinitions.ts'
import {updateBoardCards } from '../../services/boards.service.ts'
import {updateListCards} from '../../services/lists.service.ts'
import {createNewCard} from '../../services/cards.service.ts'
import {updateUserCards} from '../../services/users.service.ts'
import AppContext from '../../context/AppContext';
import type { UserState } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const CreateNewCard = ({ idBoard, idList }: CreateNewCardProps) => {

    const { userData } = useContext<UserState>(AppContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const [newCard, setNewCard] = useState<NewCard>({
        title: ''
    }) 

    const [formNewCardError, setFormNewCardError] = useState<FormNewCardError>({
        formErr: false,
        titleErr: false,
    })


    const updateNewCard = (field:string) => (e: React.ChangeEvent<HTMLInputElement>) =>{
        if(field === 'title') setFormNewCardError({...formNewCardError, titleErr: false, formErr: false}) 

        setNewCard ({
            ...newCard,
            [field]: e.target.value,
    })
    }


    const saveNewCard = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
       e.preventDefault()
        let errors = { ...formNewCardError, formErr: false };

        if (!newCard.title) {
            errors = ({ ...errors, titleErr: true, formErr: true })
        } 

        setFormNewCardError({ ...errors });
        if(errors.formErr) return "Error new board form";
        if (userData == null) return 

        createNewCard(userData.handle, newCard.title, idBoard, idList)
        .then(result => {
          setNewCard({
            title: ''
          })
          
        updateUserCards(result.id, userData.handle)
        .catch(e => console.error(e))  
        
        updateBoardCards(result.id, idBoard)
        .catch(e => console.error(e))  

        updateListCards(result.id, idList)
        .catch(e => console.error(e))  

            return result.id
        })
        .catch(e => console.error(e))    

    }


  return (
    <div>
      <button
        className="btn-primary"
        onClick={() => setOpen(true) }
      >
        + Add Card
      </button>
      {open && (
        <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Card</h3>
           <div className="mt-2.5">
                <input type="text" 
                placeholder="Title of your new card" 
                className="input input-warning" 
                onChange={updateNewCard('title')}
                />
            </div>
          <div className="modal-action">
           
                <button className="btn-primary" 
                onClick={e => {
                  saveNewCard(e);
                  setOpen(false)
                }}
                >Create Card</button>
                
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
};

export default CreateNewCard;
