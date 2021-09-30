const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")


const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')        
    );
};

const tokens = (n) => ether(n)

const EVM_REVERT = 'VM Exception while processing transaction: revert';
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';


module.exports = async function(callback){
    
    try{
        console.log('...script running')
        console.log('Token address: ', Token.address)
        console.log('Exchange address: ', Exchange.address)
        
        //Fetch accounts from wallet
        const accounts = await web3.eth.getAccounts()
        
        //Fetch the deployed token
        const token = await Token.deployed()
        console.log('Token Fetched', token.address)
        
        //Fetch the deployed exchange
        const exchange = await Exchange.deployed()
        console.log('Exchange Fetched', exchange.address)
        
        //Give tokens to account[1]
        const sender = accounts[0]
        const receiver = accounts[1]
        let amount = web3.utils.toWei('10000', 'ether') //10,000 tokens
        
        await token.transfer(receiver, amount, {from: sender})
        console.log(`Transferred ${amount} tokens from ${sender} to ${receiver}`)
        
        /*----------------------DEPOSITS-------------------------------------------*/
        const user1 = accounts[0]
        const user2 = accounts[1]
        
        //User 1 deposits ether into the exchange
        amount = 1
        await exchange.depositEther({from:user1, value: ether(amount)})
        console.log(`Deposited ${amount} Ether from ${user1}`)

        //User 2 approves tokens on the token contract
        amount = 10000
        await token.approve(exchange.address, tokens(amount), {from:user2})
        console.log(`Deposited ${amount} Tokens from ${user2}`)
        
        //User 2 deposits tokens on the exchange
        await exchange.depositToken(token.address, tokens(amount), {from:user2})
        console.log(`Deposited ${amount} Tokens from ${user2}`)
        
        
        /*------------------------CANCELS------------------------------------------*/
        //User1 makes order to get tokens in exchange for ether
        let result
        let orderId
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1})
        
        //User 1 cancels order
        orderId = result.logs[0].args.id
        await exchange.cancelOrder(orderId, {from: user1})
        console.log(`Canceled order ${orderId} from ${user1}`)
        
        
        /*---------------------Filled Orders--------------------------------------*/
        //User1 makes order
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1})
        console.log(`Made order from ${user1}`)
        
        //User 2 fillsthe order
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, {from: user2})
        console.log(`Filled order from ${user2}`)
        
        //await wait(1)
        
        //User1 makes order
        result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), {from: user1})
        console.log(`Made order from ${user1}`)
        
        //User 2 fillsthe order
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, {from: user2})
        console.log(`Filled order from ${user2}`)
        
        //await wait(1)
        
        //User1 makes order
        result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), {from: user1})
        console.log(`Made order from ${user1}`)
        
        //User 2 fillsthe order
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, {from: user2})
        console.log(`Filled order from ${user2}`)
        
        //await.wait(1)
        
        /*------------------------------Open orders---------------------------------*/
        
        for(let i=1; i <= 10; i++){
            result = await exchange.makeOrder(token.address, tokens(10.5 * i), ETHER_ADDRESS, ether(0.01), {from: user1})
            console.log(`Made order from ${user1}`)
            
          //  await.wait(1)
            
        }
        
        for(let i=1; i <= 10; i++){
            result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10 * i), {from: user2})
            console.log(`Made order from ${user2}`)
            
            //await.wait(1)
            
        }
        
        
        
    }catch(error){
        console.log(error)
    }
    
    callback()    
    
}