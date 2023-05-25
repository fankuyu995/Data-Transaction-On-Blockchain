// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
contract data_transaction {
    struct data {
        string dataHash;        //hash of the dataset
        string dataset_name;    //name of the dataset
        string data_category;   //category of the dataset
        address seller;         //address of the seller (the one who uploaded the dataset)
        uint price;             //price of the dataset (wei)
        string description;     //description of the dataset
        address[] buyers;       //an array containing addresses of the all the buyers of the dataset
    }
    // struct ML_API_key {
    //     string api_key;
    //     string ml_product_name;
    //     address seller;
    //     uint price;
    //     string description;
    //     address[] buyers;
    // }

    //mappings for dataset
    mapping(uint => data) data_map;
    // mapping(uint => ML_API_key) ML_API_keys;

    //variables to track dataset
    uint raw_data_id;
    uint[] raw_data_id_list;
    // uint ml_key_id;
    // uint[] ml_key_id_list;
    
    //fallback function that receives ethers
    receive () external payable {}
    event excess_eth_returned(address, uint);  //exchange excess eth sent to sender

    //function uploads the dataset to the contract
    function uploadData(string memory data_hash, string memory dataset_name, string memory data_category,uint price, string memory data_description) public payable {
        data_map[raw_data_id] = data(data_hash, dataset_name, data_category, msg.sender, price, data_description, new address[](0));
        payable(msg.sender).transfer(msg.value);            //send ether back to the sender 
        emit excess_eth_returned(msg.sender, msg.value);    //triggers (emit) the event excess_eth_returned
    
        raw_data_id_list.push(raw_data_id);                 //appends the dataset id to the raw_data_id_list array
        raw_data_id += 1;                                   //increment the next available data id by 1
    }

    function purchaseData(uint data_id) public payable{
        require(msg.value >= data_map[data_id].price, "Indaquate ETH sent");
        payable(msg.sender).transfer(msg.value - data_map[data_id].price);
        emit excess_eth_returned(msg.sender, msg.value - data_map[data_id].price);
        payable(data_map[data_id].seller).transfer(data_map[data_id].price);
        data_map[data_id].buyers.push(msg.sender);
    }

    //function to view the purchased data
    //returns the data hash of the data set if the buyer has purchased the dataset 
    //else a message that the dataset has not been purchased
    function view_purchased_raw_data(uint data_id) public view returns (string memory) {
        for(uint i=0; i<data_map[data_id].buyers.length; i++){
            if(msg.sender==data_map[data_id].buyers[i]){
                return data_map[data_id].dataHash;
            }
        }
        return "You haven't purchased this dataset!";
    }

    //returns the raw_data_id_list
    function view_raw_data_id_list() public view returns (uint[] memory) {
        return raw_data_id_list;
    }

    //For front-end view
    // function view_ml_key_id_list() public view returns (uint[] memory) {
    //     return ml_key_id_list;
    // }

    //Function to retrieve information about the uploaded dataset
    //returns a list of arrays with the name, price, category and description of the dataset
    function retrieve_raw_data_info(uint[] memory data_id_list) public view returns (string[] memory, uint[] memory, string[] memory,string[] memory){
        string[] memory dataset_name_list = new string[](data_id_list.length);
        uint[] memory data_price_list = new uint[](data_id_list.length);
        string[] memory data_category_list = new string[](data_id_list.length);
        string[] memory data_description_list = new string[](data_id_list.length);
        //adds all the relevant information about the dataset to the relevant array
        for (uint i=0; i<data_id_list.length; i++){
             dataset_name_list[i] = data_map[data_id_list[i]].dataset_name;
             data_price_list[i] = data_map[data_id_list[i]].price;
             data_category_list[i] = data_map[data_id_list[i]].data_category;
             data_description_list[i] = data_map[data_id_list[i]].description;
        }
        return (dataset_name_list, data_price_list, data_category_list, data_description_list);
    }
    
    }
