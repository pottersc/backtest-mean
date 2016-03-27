# backtest-mean

The Stock Trading Backtest application is a web based too that allows users to create and run backtesting
scenarios. Users can specify a stock ticker symbol, investment cash amount and investment time span, along with 
buy and sell trading triggers.  This tool will then collect the historical stock market data and go day by day through
each potential trading day to determine if a buy or sell is triggered.  The trading indicators as well as the 
portfolio value are all plotted together in a output chart.
This application also allows users to manage their previously run scenarios such that can list, delete, or re-run
their previous analysis.

The application is developed usi8ng the MEAN (Mongo Express Angular NodeJS) stack and leverages heavily off the 
[Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack)

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

4. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.


