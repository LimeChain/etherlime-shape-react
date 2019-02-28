# etherlime-shape-react
This project presents ready to use dApp with predefined React front-end framework and Etherlime integration.
The provided boilerplate code contains all modules and settings needed to facilitate its usage - basic AG modules, a simple Solidity smart contract and scripts for deployment on the Blockchain.
It gives a helpful code scaffolding for further Etherlime project development and shows examples how to read and record a data on the Blockchain through the browser.
The dApp represents a smart contract that manages a ToDo List and enables interaction with each ToDo's status. It uses a local ganache and web3Provider to sign transactions with MetaMask 


# Let's start
First you need to install Etherlime and to download the shape. In a new empty folder run the following commands:
```
    npm install -g etherlime
    etherlime shape react
```

Now a tidy structured project must have been shaped. Next step is to build a local ganache.

```
    etherlime ganache
```

Deploy the ToDoManager.sol smart contract. In a new console tab run:

```
    etherlime deploy
```

The contract has been compiled within the deployment. But if you need to do it separately just run `etherlime compile`.

 Please note: Due to the restrictions of the React framework, a compilation of contract is made during running the project with `yarn start` command and this contract is placed withing `src` folder.

When your deployment is finished successfully copy the address of the contract that is shown as a Result in the report table and assign its value to `contractAddress` variable declared in `web/src/app/App.js` file. Now we are ready to run the dApp.

```
    yarn start
```
If everything goes well now MyToDo dApp is welcoming you!

# Metamask connection
Get Metamask extension to your browser or if you already have just log in. To use local ganache's accounts you need to import them (or a few of them) by copying their private keys. Then connect Metamask to the private network - Localhost 8545. And go on - fill up your ToDo list.


# Smart contract interaction
If you updated the smart contract's address as we encouraged you to do above, MyToDo dApp should be already connected to the Blockchain and ready to record new ToDos into the block. So just add a new task and it will automatically appear in the list bellow. Meanwhile Metamask will ask you to confirm the transaction.
Next you'll have the options to change ToDo's status or to delete it from the list.


# Run tests
MyToDo dApp includes tests. To test the smart contract run `etherlime test`.