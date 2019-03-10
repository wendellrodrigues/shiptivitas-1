import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

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


    //this.dragulaDecorator = this.dragulaDecorator.bind(this); //Binds the changes made by dragula


    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    }

  }

  componentDidMount () {
    const referencedArray = [ 
      this.swimlanes.backlog.current, 
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current
    ]
    this.dragulaDecorator(referencedArray);
    
  };

  componentDidUpdate(prevProps, prevState){
    if(this.state.foo !== prevState.foo){
      console.log('FOO')
    } 
  }

  onChange(e) {
    console.log('onchangee', e)
  }


  async dragulaDecorator(componentBackingInstance) {

    
    console.log('state before', this.state);

    if (componentBackingInstance) {
      let options = { };
      Dragula(componentBackingInstance, options).on('drop',(el, target, source, sibling) => {

        console.log('element', el);

        //const sourceID = source.id;   //This is the source column ID
        let   targetID = target.id;   //This is the target column ID
        const movedId = el.id;        //This is the id of the element to be moved
        //const siblingId = sibling.id  //This is the sibling ID (card after where card was moved to)


        //Get client array and position of the card to move
        const clientsArray = this.getClients();
        const clientPos = movedId-1;

        //Get card
        const movedClient = clientsArray[clientPos];


        //Changes 'inProgress' to 'in-progress'
        if (targetID === 'inProgress'){
          targetID = 'in-progress'
        }

        //Changes status of the movedCient 
        movedClient.status = targetID;

        console.log('el', el.className);
        

        //Set the state 
        this.setState({
          backlog: clientsArray.filter(client => !client.status || client.status === 'backlog'),
          inProgress: clientsArray.filter(client => client.status && client.status === 'in-progress'),
          complete: clientsArray.filter(client => client.status && client.status === 'complete')
        })

        console.log('state after', this.state);

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
      <Swimlane name={name} clients={clients} dragulaRef={ref} id={id}/>
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
