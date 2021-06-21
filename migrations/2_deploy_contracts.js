var Token = artifacts.require("./Token.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
};

/*
module.exports = function(deployer) {
  deployer.deploy(Exchange, '0xF619b7761d7Ed94D0F3B218C69307958486014ac', 10);
};
*/