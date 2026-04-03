import { useState,useContext, useRef } from 'react'
import type {NewList, FormNewListError, CreateNewListProps} from '../../common/typeScriptDefinitions.ts'
import {updateBoardLists } from '../../services/boards.service.ts'
import {createNewList} from '../../services/lists.service.ts'
import {updateUserLists} from '../../services/users.service.ts'
import AppContext from '../../context/AppContext';
import type { UserState } from '../../context/AppContext';

const CreateNewList = ({ idBoard }: CreateNewListProps) => {

    const { userData } = useContext<UserState>(AppContext);
    const [open, setOpen] = useState(false);

    const [newList, setNewList] = useState<NewList>({
        title: ''
    }) 

    const [formNewListError, setFormNewListError] = useState<FormNewListError>({
        formErr: false,
        titleErr: false,
    })


    const updateNewList = (field:string) => (e: React.ChangeEvent<HTMLInputElement>) =>{
        if(field === 'title') setFormNewListError({...formNewListError, titleErr: false, formErr: false}) 

        setNewList ({
            ...newList,
            [field]: e.target.value,
    })
    }


    const saveNewList = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
       e.preventDefault()
        let errors = { ...formNewListError, formErr: false };

        if (!newList.title) {
            errors = ({ ...errors, titleErr: true, formErr: true })
        } 

        setFormNewListError({ ...errors });
        if(errors.formErr) return "Error new board form";
        if (userData == null) return 

        createNewList(newList.title, idBoard, userData.handle)
        .then(result => {
          setNewList({
            title: ''
          })
          
        updateUserLists(result.id, userData.handle)
        .catch(e => console.error(e))  
        
        updateBoardLists(result.id, idBoard)
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
        + Add List
      </button>
      {open && (
        <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New List</h3>
           <div className="mt-2.5">
                <input type="text" 
                placeholder="Title of your new list" 
                className="input input-warning" 
                onChange={updateNewList('title')}
                />
            </div>
          <div className="modal-action">
           
                <button className="btn-primary" 
                onClick={e => {
                  saveNewList(e);
                  setOpen(false)
                }}
                >Create List</button>
                
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

export default CreateNewList;
