import React from 'react';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

const Dragula = require('dragula');

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    const clients = this.getClients();
    
    this.state = {
      clients: {
        backlog: clients.filter(client => !client.status || client.status === 'backlog'),
        inProgress: clients.filter(client => client.status && client.status === 'in-progress'),
        complete: clients.filter(client => client.status && client.status === 'complete'),
      }
    };

    this.dragulaDecorator = this.dragulaDecorator.bind(this); //Binds the changes made by dragula

    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    }

  }
/**
 * When page loads, this function fires
 */
  componentDidMount () {
    const referencedArray = [ 
      this.swimlanes.backlog.current, 
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current
    ]
    this.dragulaDecorator(referencedArray);  
  };


  /**
   * Finds position of a value in an array by checking its Id
   * @param {Array} array 
   * @param {Number} id 
   */
  findPosition(array, id) {
    let pos = null;
    for(let i=0; i<array.length; i++){
      if(array[i].id === id){
         pos = i;
      }
    }
    return pos;
  }

  /**
   * Alters the swimlane. Takes card from one swimlane, deletes it, and moves it to target swimlane
   * Also handles moving cards within the swimlane (sourceLane == targetLane )
   * @param {Array} sourceLane    The source lane to delete from
   * @param {Array} targetLane    The target lane to add to
   * @param {Number} sourceID     The position of the source to be deleted
   * @param {Number} siblingID    The position of the sibling to move card to (before)
   * @param {Object} movedClient  The card to move
   */
  alterSwimLanes(sourceLane, targetLane, sourceID, siblingID, movedClient) {

    //Create insert function
    Array.prototype.insert = function ( index, item ) {
      this.splice( index, 0, item );
    };

    //Find position in source to delete
    const posToDelete = this.findPosition(sourceLane, sourceID);
    //Delete from source lane
    sourceLane.splice(posToDelete, 1);
    //Find position to insert into
    let posToInsert = this.findPosition(targetLane, siblingID);
    //Handles corner case of inserting at the end of an array (no sibling) / Received from dragulaDecorator
    if(posToInsert === null) posToInsert = siblingID
    //Insert into target swimlane
    targetLane.insert(posToInsert, movedClient);
  }

  /**
   * The drag-and-drop feature
   * Sets state based on moving items around in the swimlanes or between swimlanes
   * @param {Object} componentBackingInstance 
   */
 dragulaDecorator(componentBackingInstance) {

    const drake = Dragula(componentBackingInstance)

    if (componentBackingInstance) {
      drake.on('drop',(el, target, source, sibling) => {
        
        let   sourceID = source.id;   //This is the source column ID
        let   targetID = target.id;   //This is the target column ID
        const movedId = el.id;        //This is the id of the element to be moved
       
        let siblingId = 0;
        
        //Handle case if siblingId is out of bounds (replaces posToInsert in alterSwimLanes())
        const thisTarget = this.state.clients[targetID];
        if(sibling){
          siblingId = sibling.id
        } else {
          siblingId = thisTarget.length;
        }

        
        //Get client array and position of the card to move
        const clientsArray = this.getClients();
        const clientPos = movedId-1;

        //Get card
        const movedClient = clientsArray[clientPos];

        //Changes 'inProgress' to 'in-progress'
        if(targetID === 'inProgress') targetID = 'in-progress';
        if(sourceID === 'inProgress') sourceID = 'in-progress'

        //Changes status of the movedCient 
        movedClient.status = targetID;

        const thisBacklog = this.state.clients.backlog;
        const thisInProgress = this.state.clients.inProgress;
        const thisComplete = this.state.clients.complete;

        //Backlog -> In-Progress
        if( sourceID === 'backlog' && targetID === 'in-progress'){
          this.alterSwimLanes(thisBacklog, thisInProgress, movedId, siblingId, movedClient);
        }

        //Backlog -> Complete
        if(sourceID === 'backlog' && targetID === 'complete'){
          this.alterSwimLanes(thisBacklog, thisComplete, movedId, siblingId, movedClient);
        }

        //In-Progress -> Backlog
        if(sourceID === 'in-progress' && targetID === 'backlog'){
          this.alterSwimLanes(thisInProgress, thisBacklog, movedId, siblingId, movedClient);
        }

        //In-Progress -> Complete
        if(sourceID === 'in-progress' && targetID === 'complete'){
          this.alterSwimLanes(thisInProgress, thisComplete, movedId, siblingId, movedClient);
        }

        //Complete -> Backlog
        if(sourceID === 'complete' && targetID === 'backlog'){
          this.alterSwimLanes(thisComplete, thisBacklog, movedId, siblingId, movedClient);
        }

        //Complete -> In-Progress
        if(sourceID === 'complete' && targetID === 'in-progress'){
          this.alterSwimLanes(thisComplete, thisInProgress, movedId, siblingId, movedClient);
        }

        //Backlog -> Backlog
        if( sourceID === 'backlog' && targetID === 'backlog'){
          this.alterSwimLanes(thisBacklog, thisBacklog, movedId, siblingId, movedClient);
        }

        //In-Progress -> In-Progress
        if( sourceID === 'in-progress' && targetID === 'in-progress'){
          this.alterSwimLanes(thisInProgress, thisInProgress, movedId, siblingId, movedClient);
        }

        //Complete -> Complete
        if( sourceID === 'complete' && targetID === 'complete'){
          this.alterSwimLanes(thisComplete, thisComplete, movedId, siblingId, movedClient);
        }

        //Create new client array based on changes in swim lanes
        const clientArray = {
          backlog: thisBacklog,
          inProgress: thisInProgress,
          complete: thisComplete
        }
         
        //Drake is unable to manipulate DOM, such that no conflicts with react dom
        drake.cancel(true);

        //Sets state with altered swimlanes
        this.setState({
            clients: clientArray
        })       

      });
    }
  };

  getClients() {
    return [
      ['1','Stark, White and Abbott','Cloned Optimal Architecture', 'in-progress'],
      ['2','Wiza LLC','Exclusive Bandwidth-Monitored Implementation', 'complete'],
      ['3','Nolan LLC','Vision-Oriented 4Thgeneration Graphicaluserinterface', 'backlog'],
      ['4','Thompson PLC','Streamlined Regional Knowledgeuser', 'in-progress'],
      ['5','Walker-Williamson','Team-Oriented 6Thgeneration Matrix', 'in-progress'],
      ['6','Boehm and Sons','Automated Systematic Paradigm', 'backlog'],
      ['7','Runolfsson, Hegmann and Block','Integrated Transitional Strategy', 'backlog'],
      ['8','Schumm-Labadie','Operative Heuristic Challenge', 'backlog'],
      ['9','Kohler Group','Re-Contextualized Multi-Tasking Attitude', 'backlog'],
      ['10','Romaguera Inc','Managed Foreground Toolset', 'backlog'],
      ['11','Reilly-King','Future-Proofed Interactive Toolset', 'complete'],
      ['12','Emard, Champlin and Runolfsdottir','Devolved Needs-Based Capability', 'backlog'],
      ['13','Fritsch, Cronin and Wolff','Open-Source 3Rdgeneration Website', 'complete'],
      ['14','Borer LLC','Profit-Focused Incremental Orchestration', 'backlog'],
      ['15','Emmerich-Ankunding','User-Centric Stable Extranet', 'in-progress'],
      ['16','Willms-Abbott','Progressive Bandwidth-Monitored Access', 'in-progress'],
      ['17','Brekke PLC','Intuitive User-Facing Customerloyalty', 'complete'],
      ['18','Bins, Toy and Klocko','Integrated Assymetric Software', 'backlog'],
      ['19','Hodkiewicz-Hayes','Programmable Systematic Securedline', 'backlog'],
      ['20','Murphy, Lang and Ferry','Organized Explicit Access', 'backlog'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }

  renderSwimlane(name, clients, ref, id) {
    return (
      <div><Swimlane name={name} clients={clients} dragulaRef={ref} id={id}/></div>
    );
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4" >
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog, 'backlog') }
            </div>
            <div className="col-md-4" >
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress, 'inProgress')}
            </div>
            <div className="col-md-4" >
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete, 'complete')}
            </div>
          </div>
        </div>
      </div>
    );
  }
}