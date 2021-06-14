pragma solidity ^0.8.0;

import "../client/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../client/node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";



contract Token{
    using SafeMath for uint;

    string public name = "Imba Token";
    string public symbol = "IMBA";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    //track balances
    mapping(address => uint256) public balanceOf;
        
    //Events
    event Transfer(address indexed from, address indexed to, uint256 value);


    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    //send tokens
    function transfer(address _to, uint256 _value) public returns (bool success){
        require(_to != address(0));
        require(balanceOf[msg.sender] >= _value );

        //Remove from sender
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        //Add to to
        balanceOf[_to] = balanceOf[_to].add(_value);

        emit Transfer(msg.sender, _to, _value);

        return true;

    }



}


