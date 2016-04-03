'use strict';

/**
 * @author Scott Potter
 * Service that prepares the chart that displays the results of a backtest analysis.
 * The chart includes 1) stock price line, 2) investment value line, and 3) a line for each unique
 * trading indicator such as simple moving average for specified number of days.
 * The google chart wrapper directive from https://github.com/angular-google-chart/angular-google-chart
 * is used to simplify the chart creation and provide added features such as dynamic hiding of chart lines.
 * This charting capability follows the requirements specified in the google chart documentation at
 * https://developers.google.com/chart/interactive/docs/gallery/linechart
 */

angular.module('backtestMeanApp')
  .factory('ChartService', ['googleChartApiPromise', '$filter',function (googleChartApiPromise, $filter) {
    var ChartService = {};

    ChartService.buildChart = function(backtestResults, completionCallback){
        var chartObject = {};
        chartObject.type = 'LineChart';
        chartObject.displayed = false;
        var data = new google.visualization.DataTable();
        // define the columns for the chart
        data.addColumn('date', 'Trade Date');
        data.addColumn('number', 'Stock Price');
        data.addColumn({type: 'string', role: 'annotation'}); // annotation role col.
        data.addColumn({type: 'string', role: 'annotationText'}); // annotationText col.
        data.addColumn('number', 'Investment Value');
        // add additional columns as required for the number of trade indicators in backtest result data
        _.each(backtestResults.availableIndicatorNames, function (indicatorName) {
          data.addColumn('number', indicatorName);
        });

        // add the data for the chart for each trade day
        data.addRows(backtestResults.tradeDays.length);
        $.each(backtestResults.tradeDays, function (index, tradeDay) {
          data.setCell(index, 0, tradeDay.date);
          data.setCell(index, 1, (tradeDay.price));
          data.setCell(index, 2, getTradeAnnotation(tradeDay));
          data.setCell(index, 3, getTradeAnnotationText(tradeDay));
          data.setCell(index, 4, (tradeDay.investmentValue));
          var colIndex = 5;
          $.each(backtestResults.availableIndicatorNames, function (indicatorIndex, indicatorName) {
            var indicator = _.findLast(tradeDay.indicators,['name',indicatorName]);
            if (indicator !== null) {
              data.setCell(index, colIndex, indicator.value);
            }
            colIndex++;
          });
        });

        // define all of the chart options
        var options = {
          title: 'Backtest Analysis Results: Ending Investment=' + $filter('currency')(backtestResults.endingInvestment)+', Return='+_.round(backtestResults.investmentReturnPercent,1)+'%',
          legend: {position: 'top', maxLines: 2},
          displayAnnotations: true,
          explorer: {
            maxZoomOut: 1,
            maxZoomIn: 0.1,
            keepInBounds: true,
            axis: 'horizontal'

          },
          'colors': ['#0000FF', '#009900', '#CC0000', '#DD9900', '#000000', '#ff33cc', '#99ccff', '#ff9966', '#666633'],
          'defaultColors': ['#0000FF', '#009900', '#CC0000', '#DD9900', '#000000', '#ff33cc', '#99ccff', '#ff9966', '#666633'],
          series: {
            0: {targetAxisIndex: 0},
            1: {targetAxisIndex: 1}
          },
          vAxes: {
            // Adds titles to each axis.
            0: {title: 'Stock Price ($)'},
            1: {title: 'Investment Value ($)'}
          }
        };
        chartObject.options = options;
        chartObject.data = normalizeGoogleDataTableObject(data);
        // initialize data for the 'hideSeries' capability
        var numColumnsToView = 5 + backtestResults.availableIndicatorNames.length;
        chartObject.view = {
          columns: initializeViewArray(numColumnsToView)
        };
      completionCallback;
        return chartObject;
    };


    /**
     * Allows a user to hide/show a chart line by selecting the line in the chart legend
     * Follows the template defined at
     * http://angular-google-chart.github.io/angular-google-chart/docs/latest/examples/hide-series/
     * @param selectedItem  : The chart line (in the legend) that the user clicked on to enable hiding
     * @param chartObject : the chartObject that is currently displayed to the user
     */
    ChartService.hideSeries = function (selectedItem, chartObject) {
      console.log('hide:'+selectedItem);
      var col = selectedItem.column;
      if (selectedItem.row === null) {
        if (chartObject.view.columns[col] === col) {
          chartObject.view.columns[col] = {
            label: chartObject.data.cols[col].label,
            type: chartObject.data.cols[col].type,
            calc: function () {
              return null;
            }
          };
          chartObject.options.colors[col - 1] = '#CCCCCC';
        }
        else {
          chartObject.view.columns[col] = col;
          chartObject.options.colors[col - 1] = chartObject.options.defaultColors[col - 1];
        }
      }
    };

    /**
     * Initialize an array of all the series (lie lines) that are to be displayed in the chart to be used
     * in the 'hideSeries' function.
     * @param numCols : number of lines (series) displayed on the chart
     * @returns {Array} : ex [0,1,2,3,4] if there are 5 lines on the chart
     */
    function initializeViewArray(numCols) {
      var viewArray = [];
      for (var i = 0; i < numCols; i++) {
        viewArray.push(i);
      }
      return viewArray;
    }

    /**
     * Create teh annotation that will be displayed on chart when any important transaction occurred
     * Basically disply either BUT or SELL text as appropriate
     * @param tradeDay : tradeDay object as returned from backtest service
     * @returns : string containing the annotation
     */
    function getTradeAnnotation(tradeDay) {
      var annotation;
      if (tradeDay.action === 'BUY' || tradeDay.action === 'SELL') {
        annotation = tradeDay.action;
      } else {
        annotation = null;
      }
      return annotation;
    }

    /**
     * Create and return an annotation to be displayed when a user hovers over a data point in the chart
     * @param tradeDay :tradeDay object as returned from backtest service
     * @returns {string} : detailed description of the transaction that occurred on the specified tradeDay
     */
    function getTradeAnnotationText(tradeDay) {
      return tradeDay.action + ' ' + $filter('number')(tradeDay.numSharesTraded) + ' shares at ' + (tradeDay.price) + ' on ' + $filter('date')(tradeDay.date) + ' with proceeds of ' + $filter('currency')(tradeDay.investmentValue);
    }

    /**
     * Transform dataTable object so that is is acceptable to googleChart
     * This function needs additional attention as there has to be a better way to clean up the dataTable object
     * @param dataTableObject
     */
    function normalizeGoogleDataTableObject(dataTableObject) {
      return JSON.parse(JSON.parse(JSON.stringify(dataTableObject)));
    }

    return ChartService;
  }]);
