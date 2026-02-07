import CreateNewBoard from "../CreateNewBoard/CreateNewBoard";

const BoardsNav = () => {


    return (
        <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Boards:</p>
            <CreateNewBoard />
        </div>
           
       
    )

}

export default BoardsNav;