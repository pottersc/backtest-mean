var request = require('request');
var _ = require('lodash');


/**
 * Retrieve the historical stock quotes for the specified ticker symbol and dates
 * @param ticker : ticker symbol of the stock
 * @param start : first date to collect data for
 * @param end : last date to collect data for
 * @returns {Promise} : success returns an array of stock quotes
 */
exports.getQuotes = function(ticker, startStr, endStr) {
  ticker = ticker.trim();
  let start = parseDate(startStr);
  let end = parseDate(endStr);
  return new Promise(function(resolve, reject) {
    var url = 'http://ichart.yahoo.com/table.csv?s='+ticker+'&a='+start.getMonth()+'&b='+start.getDate()+'&c='+start.getFullYear()+'&d='+end.getMonth()+'&e='+end.getDate()+'&f='+end.getFullYear();
    request(url, function(error, response, csvContents){
      if(!error && response.statusCode == 200) {
              var first = true;
              var quotes = [];
              _.forEach(_.split(csvContents,'\n'),function(line) {
                // line format is: Date,Open,High,Low,Close,Volume,Adj Close
                if (!first && line.length > 10) {
                  var fields = _.split(line, ',');
                  var quote = {date: fields[0], price: Number(_.trim(fields[6]))};
                  quotes.push(quote);
                }
                first = false;
              });
              _.reverse(quotes);
              resolve(quotes);
      }else {
        console.log('error during getQuotes:'+error);
        reject(error);
      }
    });
  });
}

/**
 * Convert a date string in format 2016-01-21 into a Date object
 * in EST timezone.  This is done by adding 5 hours to the UTC Date
 * @param dateStr
 * @returns {Date}
 */
function parseDate(dateStr){
  var dateElements = _.split(dateStr,'-');
  var year = Number(_.trim(dateElements[0]));
  var month = Number(_.trim(dateElements[1])) - 1;
  var day = Number(_.trim(dateElements[2]));
  return new Date(Date.UTC(year,month,day,5,0,0));
}

