import { useState,useContext, useRef } from 'react'
import type {NewBoard, FormNewBoardError} from '../../common/typeScriptDefinitions.ts'
import {createNewBoard} from '../../services/boards.service.ts'
import AppContext from '../../context/AppContext';
import type { UserState } from '../../context/AppContext';
import { updateUserBoards } from '../../services/users.service.ts';
import { useNavigate } from 'react-router-dom';




const CreateNewBoard = () => {

    const { userData } = useContext<UserState>(AppContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const [newBoard, setNewBoard] = useState<NewBoard>({
        title: ''
    }) 

    const [formNewBoardError, setFormNewBoardError] = useState<FormNewBoardError>({
        formErr: false,
        titleErr: false,
    })


    const updateNewBoard = (field:string) => (e: React.ChangeEvent<HTMLInputElement>) =>{
        if(field === 'title') setFormNewBoardError({...formNewBoardError, titleErr: false, formErr: false}) 

        setNewBoard ({
            ...newBoard,
            [field]: e.target.value,
    })
    }


    const saveNewBoard = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
       e.preventDefault()
        let errors = { ...formNewBoardError, formErr: false };

        if (!newBoard.title) {
            errors = ({ ...errors, titleErr: true, formErr: true })
        } 

        setFormNewBoardError({ ...errors });
        if(errors.formErr) return "Error new board form";
        if (userData == null) return 

        createNewBoard(userData.handle, newBoard.title)
        .then(result => {
          setNewBoard({
            title: ''
          })
          
          updateUserBoards(result.id, userData.handle)
            .catch(e => console.error(e))     
            
            return result.id
        })
        .then(id => navigate('/boardView', {state: {id}}))
        .catch(e => console.error(e))    

    }


  return (
    <div>
      <button
        className="btn-primary-hover"
        onClick={() => setOpen(true) }
      >
        +
      </button>
      {open && (
        <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Board</h3>
           <div className="mt-2.5">
                <input type="text" 
                placeholder="Title of your new board" 
                className="input input-warning" 
                onChange={updateNewBoard('title')}
                />
            </div>
          <div className="modal-action">
           
                <button className="btn-primary" 
                onClick={e => {
                  saveNewBoard(e);
                  setOpen(false)
                }}
                
                >Create Board</button>
                <button className="btn-primary" 
                 onClick={() =>
                 (() => setOpen(false))
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

export default CreateNewBoard;
