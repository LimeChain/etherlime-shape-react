import React, { Component } from 'react';
import './App.css';
import { ethers } from 'ethers';
import etherlime from 'etherlime';
const ToDo = require('./contracts/ToDoManager.json');
const web3 = window.web3;



class App extends Component {

  state = { proviver: null, signer: null, contractInstance: null, toDos: null, successMessage: null, infoMessage: null, errorMessage: null, title: null, value: '', inactiveButton: false };

  componentDidMount = async () => {
    this.handleChange = this.handleChange.bind(this);

    try {
      const title = 'Welcome to my ToDo App';
      const provider = new ethers.providers.Web3Provider(web3.currentProvider);
      const signer = await provider.getSigner();

      // Please deploy the contract and put your contract address here: 
      const contractAddress = '';
      const contractInstance = await etherlime.ContractAt(ToDo, contractAddress, signer, provider);
      const successMessage = 'The contract has been set and is ready to interact with it!';
      this.setState({ provider, signer, contractInstance: contractInstance, successMessage, title });
      this.setState({ toDos: await this.getToDoStatuses() });
    } catch (e) {
      console.log(e);
      if (e.message.includes('web3 is not defined')) {
        this.addErrorMessage('Error. Make sure you are using Metamask');
      } else {
        this.addErrorMessage(e.message);
      }
    }
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }
  getToDoStatuses = async () => {
    const { contractInstance } = this.state;
    let statuses = {
      toDo: [],
      inProgress: [],
      done: []
    }

    try {
      let indexCounter = await contractInstance.indexCounter();
      let index = indexCounter.toNumber();
      for (let i = 0; i < index; i++) {
        let toDo = await contractInstance.getToDoByIndex(i)
        let status = await contractInstance.getToDoStatus(i);
        if (status === 1) {
          statuses.toDo.push(toDo);
        } else if (status === 2) {
          statuses.inProgress.push(toDo);
        } else if (status === 3) {
          statuses.done.push(toDo);
        }
      }

    } catch (e) {
      this.addErrorMessage(e.message)
    }
    return statuses;
  }


  addToDo = async () => {
    const { contractInstance, toDos } = this.state;
    let { inactiveButton } = this.state;
    const todo = this.state.value;
    try {
      inactiveButton = true;
      await contractInstance.addToDo(todo);
      this.addInfoMessage('ToDo has been added!');
      toDos.toDo.push(todo);
      inactiveButton = false;
      this.setState({ value: '', inactiveButton });
    } catch (e) {
      console.log('error', e)
      this.addErrorMessage(`Transaction failed. Are you sure you hadn't already added this ToDo! ${e.message}`);
      inactiveButton = false;
      this.setState({ inactiveButton });
    }
  }

  addInfoMessage = async (message) => {
    this.setState({ infoMessage: message });
    this.clearInfoMessage();
  }

  addErrorMessage = async (message) => {
    this.setState({ errorMessage: message });
    this.clearErrorMessage();
  }

  clearInfoMessage = async () => {
    setTimeout(() => {
      this.setState({ infoMessage: null })
    }, 5000);
  }

  clearErrorMessage = async () => {
    setTimeout(() => {
      this.setState({ errorMessage: null })
    }, 5000);
  }

  getToDoIndex = async (_toDo) => {
    const { contractInstance } = this.state;
    const indexCounter = await contractInstance.indexCounter();
    for (let i = 0; i < indexCounter; i++) {
      let toDo = await contractInstance.getToDoByIndex(i);
      if (toDo === _toDo) {
        return i
      }
    }
  }

  moveToInProgress = async (todo) => {
    const { contractInstance, toDos } = this.state;
    try {
      const index = await this.getToDoIndex(todo);
      await contractInstance.changeToDoStatus(index);
      toDos.toDo.splice(toDos.toDo.indexOf(todo), 1);
      toDos.inProgress.push(todo);
      this.addInfoMessage('Status has been changed!');
      this.setState({ toDos: toDos });
    } catch (e) {
      this.addErrorMessage(e.message);
    }
  }

  moveToDone = async (todo) => {
    const { contractInstance, toDos } = this.state;
    try {
      const index = await this.getToDoIndex(todo);
      await contractInstance.changeToDoStatus(index);
      toDos.inProgress.splice(toDos.inProgress.indexOf(todo), 1);
      toDos.done.push(todo);
      this.addInfoMessage('Status has been changed!');
    } catch (e) {
      this.addErrorMessage(e.message);
    }

  }

  removeToDo = async (todo, destination) => {
    const { contractInstance } = this.state;
    try {
      const index = await this.getToDoIndex(todo);
      await contractInstance.removeToDo(index);
      this.cleanCurrentTodo(todo, destination);
      this.addInfoMessage("ToDo has been removed!")
    } catch (e) {
      this.addErrorMessage("ToDo not found to be removed. Add it first!")
    }
  }

  cleanCurrentTodo = async (todo, destination) => {
    const { toDos } = this.state;
    if (destination === 'todo') {
      toDos.toDo.splice(toDos.toDo.indexOf(todo), 1);
    } else if (destination === 'progress') {
      toDos.inProgress.splice(toDos.inProgress.indexOf(todo), 1);
    } else if (destination === 'done') {
      toDos.done.splice(toDos.done.indexOf(todo), 1);
    }
  }



  render() {
    if (!this.state.successMessage) {
      return (
        <div>
          <h3>Loading Contract Data...</h3>
          <h5>Ensure that you provide the right contract address!</h5>
        </div>
      );
    }
    return (
      <div className="App">
        <h1>
          {this.state.title}
        </h1>

        <div className="container">
          <div className="row">
            <div className="col">
              <form className="form-inline text-center">
                <span>Add new todo:</span>
                <div className="form-group mx-sm-3 mb-2">
                  <label className="sr-only">Text for todo</label>
                  <input type="text" className="form-control" value={this.state.value} onChange={this.handleChange} id="inputTodo" placeholder="todo text" />
                </div>
                <button type="button" className="btn btn-success mb-2"
                  onClick={this.addToDo} disabled={!this.state.value || this.state.inactiveButton}>Add
            to list</button>
              </form>
              <div>
                {this.state.successMessage && <div className="alert alert-success" role="alert">
                  {this.state.successMessage}
                </div>}
                {this.state.errorMessage && <div className="alert alert-danger" role="alert" >
                  {this.state.errorMessage}
                </div>}
                {this.state.infoMessage && <div className="alert alert-info" role="alert" >
                  {this.state.infoMessage}
                </div>}
              </div>
            </div>

          </div>
        </div >
        <div className="container">
          <h2 className="text-center">Todo list:</h2>
          <div className="row">
            <div className="col-xs-4">
              <div className="todo-column">
                <span className="badge badge-secondary">TO DO</span>
                <ul className="list-group">
                  {this.state.toDos && this.state.toDos.toDo.length < 1 && <li className="list-group-item list-group-item-danger">NONE</li>}
                  {this.state.toDos && this.state.toDos.toDo.map((todo, index) => (
                    <li key={index} className="list-group-item">{todo}
                      <div className="buttons-group">
                        <button className="btn btn-primary btn-sm btn-warning" onClick={() => {
                          this.moveToInProgress(todo)
                        }}>Change
                    Status</button>
                        <button className="btn btn-primary btn-sm btn-danger" onClick={() => {
                          this.removeToDo(todo, 'todo')
                        }}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div >
            </div >
            <div className="col-xs-4">
              <div className="todo-column">
                <span className="badge badge-secondary">IN PROGRESS</span>
                <ul className="list-group">
                  {this.state.toDos && this.state.toDos.inProgress.length < 1 && <li className="list-group-item list-group-item-danger">NONE</li>}
                  {this.state.toDos && this.state.toDos.inProgress.map((todo, index) => (
                    <li key={index} className="list-group-item">{todo}
                      <div className="buttons-group">
                        <button className="btn btn-primary btn-sm btn-warning" onClick={() => {
                          this.moveToDone(todo)
                        }}>Change
                    Status</button>
                        <button className="btn btn-primary btn-sm btn-danger" onClick={() => {
                          this.removeToDo(todo, 'progress')
                        }}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div >
            </div >
            <div className="col-xs-4">
              <div className="todo-column">
                <span className="badge badge-secondary">DONE</span>
                <ul className="list-group">
                  {this.state.toDos && this.state.toDos.done.length < 1 && <li className="list-group-item list-group-item-danger">NONE</li>}
                  {this.state.toDos && this.state.toDos.done.map((todo, index) => (
                    <li key={index} className="list-group-item">{todo}
                      <div className="buttons-group">
                        <button className="btn btn-primary btn-sm btn-danger" onClick={() => {
                          this.removeToDo(todo, 'done')
                        }}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div >
            </div >
          </div >
        </div >
      </div >
    );
  }
}


export default App;
