ganache-cli -p 8081
truffle migrate --network develop
truffle exec ./scripts/seed-exchange.js --network develop
npm run start