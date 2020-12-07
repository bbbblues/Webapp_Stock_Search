
const express = require('express')
const app = express()
const request = require('request');
const path = require('path');
const fetch = require("node-fetch");

const port = process.env.PORT || 8080;

var tkey = 'c33d07a65247be5a9f64917e44a1a11f7e46cb4d';
var newsKey = 'd3b3a43250db4dcd844421c89c184221';

// app.use(express.static(process.cwd()+"/front_end/dist/stock-search/"));

// app.get('/', (req,res) => {
//     res.sendFile(process.cwd()+"/front_end/dist/stock-search/index.html");
// });

app.use(express.static(process.cwd()+"/dist/stock-search/"));

app.get('/', (req,res) => {
    res.sendFile(process.cwd()+"/dist/stock-search/index.html");
});
  

app.get('/api/details/:ticker', (req, res) => {
    var ticker = req.params.ticker;
    var isOpen = false;
    var details = {};
    var errorObj = {};

    var priceUrl = `https://api.tiingo.com/iex/?tickers=${ticker}&token=${tkey}`;
    var comDscUrl = `https://api.tiingo.com/tiingo/daily/${ticker}?token=${tkey}`;

    fetch(priceUrl).then((response) => {
        if (response.ok) {
            // console.log(response);
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((priceData) => {
        if (priceData.length == 0) {
            errorObj.errormsg = 'wrong';
            res.send(JSON.stringify(errorObj));
            // throw "not valid";
            // details.price = {};
        } else {
            priceData = priceData[0];
            let diff = new Date() - new Date(priceData.timestamp);
            if (diff < 60 * 1000) {
                isOpen = true;
            }
            details.price = priceData;
            details.isOpen = isOpen;
        }
        return fetch(comDscUrl);
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((comData) => {
        details.companyDes = comData;
        res.send(JSON.stringify(details));
    }).catch((error) => {
        console.log(error);
    });
});


app.get('/api/summary/:ticker', (req, res) => {
    var ticker = req.params.ticker;
    var isOpen = false;
    var details = {};

    var priceUrl = `https://api.tiingo.com/iex/?tickers=${ticker}&token=${tkey}`;
    var comDscUrl = `https://api.tiingo.com/tiingo/daily/${ticker}?token=${tkey}`;

    fetch(priceUrl).then((response) => {
        if (response.ok) {
            // console.log(response);
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((priceData) => {
        priceData = priceData[0];
        let diff = new Date() - new Date(priceData.timestamp);
        if (diff < 60 * 1000) {
            isOpen = true;
        }
        details.price = priceData;
        details.isOpen = isOpen;

        let chartDate = details.price.timestamp.slice(0, 10);
        let chartSampleFreq = '1min';
        let chartUrl = `https://api.tiingo.com/iex/${ticker}/prices?startDate=${chartDate}&resampleFreq=${chartSampleFreq}&token=${tkey}`;
        return fetch(chartUrl);
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((chartData) => {
        var chartSeries = [];
        for (let data of chartData) {
            let d = new Date(data.date);
            d.setHours(d.getHours() - 8);
            let timestamp = d.getTime();
            chartSeries.push([timestamp, data.close]);
        }
        details.dailyChart = chartSeries;

        return fetch(comDscUrl);
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((comData) => {
        details.companyDes = comData;
        res.send(JSON.stringify(details));
    }).catch((error) => {
        console.log(error);
    });
});


app.get('/api/news/:ticker', (req, res) => {
    var ticker = req.params.ticker;
    var details = {};

    var newsUrl = `https://newsapi.org/v2/everything?apiKey=${newsKey}&q=${ticker}`;

    fetch(newsUrl).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((newsData) => {
        let news = [];
        for (let article of newsData.articles) {
            let publishDate = new Date(article.publishedAt).toDateString(); // "Thu Oct 22 2020"
            news.push({
                url: article.url,
                title: article.title,
                description: article.description,
                source: article.source.name,
                urlToImage: article.urlToImage,
                publishedAt: publishDate
            });
        }
        details.news = news;
        res.send(JSON.stringify(details));
    }).catch((error) => {
        console.log(error);
    });
});


app.get('/api/history/:ticker', (req, res) => {
    var ticker = req.params.ticker;
    var details = {};

    let today = new Date();
    today.setFullYear(today.getFullYear() - 2);
    let historyStartDate = today.toISOString().slice(0, 10);
    var historyUrl = `https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${historyStartDate}&resampleFreq=daily&token=${tkey}`;

    fetch(historyUrl).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((hisData) => {
        var ohlc = [];
        var volume = [];
        for (let data of hisData) {
            let timestamp = (new Date(data.date)).getTime();
            ohlc.push([
                timestamp, // the date
                data.open, // open
                data.high, // high
                data.low, // low
                data.close // close
            ]);
    
            volume.push([
                timestamp, // the date
                data.volume // the volume
            ]);
        }
        details.ohlc = ohlc;
        details.volume = volume;
        res.send(JSON.stringify(details));
    }).catch((error) => {
        console.log(error);
    });
});


app.get('/api/autocomplete/:ticker', (req, res) => {
    var ticker = req.params.ticker;
    var details = [];
    
    var url = `https://api.tiingo.com/tiingo/utilities/search?query=${ticker}&token=${tkey}`;

    fetch(url).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then((data) => {
        for (let option of data) {
            details.push({
                ticker: option.ticker,
                name: option.name
            });
        }
        res.send(JSON.stringify(details));
    }).catch((error) => {
        console.log(error);
    });
    
});


app.get('*', function(req, res) {
    res.sendFile(process.cwd()+"/dist/stock-search/index.html");
});

// app.get('*', function(req, res) {
//     res.sendFile(process.cwd()+"/front_end/dist/stock-search/index.html");
// });


app.listen(port, () => {
    console.log(`Listening at port: ${port}`)
});


