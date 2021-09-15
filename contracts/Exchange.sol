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

    //Orders
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public ordersCancelled;
    mapping(uint256 => bool) public ordersFilled;
    
    uint256 public orderCount;    

    //Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );
    

    //Structures
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }


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
    
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }
    
    function cancelOrder(uint256 id) public {
        _Order storage _order = orders[id];
        require(address(_order.user) == msg.sender);
        ordersCancelled[id]= true;
        
        emit Cancel(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);
    }
    
    
    
    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount);
        require(!ordersFilled[_id]);
        require(!ordersCancelled[_id]);
    
        _Order storage _order = orders[_id];
        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
                        
        //mark order as filled
        ordersFilled[_id]= true;
        
    }    
    
    
    function _trade(uint256 _id, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
        //charge fees
        uint256 _feeAmount = _amountGive.mul(feePercent).div(100);
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
    
        //execute the trade
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
        
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
        
        
        //emit trade event
        emit Trade(_id, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, block.timestamp);

    }
    

}

