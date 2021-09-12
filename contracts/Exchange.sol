pragma solidity ^0.8.0;

import "./Token.sol";
import "../client/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../client/node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Exchange {
    using SafeMath for uint;

    address public feeAccount; //account receives fees
    uint256 public feePercent;
    
    address constant ETHER = address(0);

    //token address -> user -> amount
    mapping(address => mapping(address => uint)) public tokens;


    //Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) public {
        //Set the fee and feeAccount    
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
    
    
    //deposit & withdraw
    function depositToken(address _token, uint _amount) public {
        //Dont allow ether deposits
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    
    function withdrawToken(address _token, uint _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));     

        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    
    

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);

        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }


    function balanceOf(address _token, address _user) public view returns (uint256){
    
        return tokens[_token][_user];
    }
    

    //manage orders -make or cancel
    //handle trades
    //check balance
    
    //charge fees
    

    

}

