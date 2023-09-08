// SPDX-License-Identifier: MIT
//001) Pragma
pragma solidity ^0.8.8;

import "hardhat/console.sol";

// 002)Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
 
// Errors: Use name of contract with errors by this u can get which of your contract is throwing error
error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Nikhil Pandey
 * @notice This contract is demo a sample funding contract
 * @dev This implements price feeds as our library
 */

//Interfaces, Libraries and then contracts
contract FundMe {
    // 1) Type declarations
    using PriceConverter for uint256;

    //2) State Variables
    mapping(address => uint256) public s_addressToAmountFunded;
    address[] private s_funders;

    AggregatorV3Interface public s_priceFeed;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable  i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    // 3)Modifiers
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    //4)Functions
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
    * @notice This function fund this contract
    * @dev This implements price feeds as our library
    */
    
    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
        }
    
    
    function withdraw() public payable onlyOwner {
        console.log("Withdrawing your balance please wait");
        for(uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
    
    function cheaperWithdraw() public payable onlyOwner{
        address[] memory funders  = s_funders;
        for(uint256 funderIndex=0; funderIndex < funders.length;funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess," Call Failed");
    }
    
    function getOwner() public view returns(address){
        return i_owner;
    }
    
    function getFunders(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }


    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    

}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly