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

    //person => exchange => token amount
    mapping(address => mapping(address => uint)) public allowance;

    //Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);


    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    //send tokens
    function transfer(address _to, uint256 _value) public returns (bool success){

        require(balanceOf[msg.sender] >= _value );
        _transfer(msg.sender, _to, _value);

        return true;

    }

    //approve tokens
    function approve(address _spender, uint256 _value) public returns (bool success){
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transfer from (called by exchange contract)
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);

        _transfer(_from, _to, _value);

        return true;
    }

    function _transfer(address _from , address _to, uint256 _value) internal {
        require(_to != address(0));
        
        //Remove from sender
        balanceOf[_from] = balanceOf[_from].sub(_value);
        //Add to to
        balanceOf[_to] = balanceOf[_to].add(_value);

        emit Transfer(_from, _to, _value);

    }

}


