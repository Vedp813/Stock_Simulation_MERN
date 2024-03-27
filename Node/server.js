const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 8000;
const { DateTime } = require('luxon');
const {MongoClient} = require('mongodb');


app.use(cors());
app.use(express.json());

// const uri = 'mongodb+srv://vhpatel:jnfpeM3AUn4okfmv@cluster0.zqi0e9c.mongodb.net/assignment_3';

// const client = new MongoClient(uri);

// client.connect().then(() => {
//     console.log('Connected to MongoDB');
//     const db = client.db('assignment_3');
//     const money = db.collection('Money');
//     const watchlist = db.collection('Watchlist');

//     app.get('/money', (req, res) => {
//         money.find().toArray().then(data => {
//             console.log('Money retrieved');
//             res.send(data);
//         }).catch(err => {
//             console.error('Error retrieving money:', err);
//             res.status(500).send('An error occurred while retrieving money');
//         });
//     });

//     app.post('/watchlist/post', (req, res) => {
//         const ticker = req.body.ticker;
//         if (!ticker) {
//             return res.status(400).send('Ticker is required');
//         }

//         watchlist.insertOne({ ticker })
//             .then(() => {
//                 console.log('Ticker added to watchlist');
//                 res.sendStatus(200);
//             })
//             .catch(err => {
//                 console.error('Error adding ticker to watchlist:', err);
//                 res.status(500).send('An error occurred while adding ticker to watchlist');
//             });
//     });

//     app.get('/watchlist/remove/:ticker', (req, res) => {
//         const ticker = req.params.ticker;
//         watchlist.deleteOne({ ticker })
//             .then(() => {
//                 console.log('Ticker removed from watchlist');
//                 res.sendStatus(200);
//             })
//             .catch(err => {
//                 console.error('Error removing ticker from watchlist:', err);
//                 res.status(500).send('An error occurred while removing ticker from watchlist');
//             });
//     });

//     app.get('/watchlist/get', (req, res) => {
//         watchlist.find().toArray().then(data => {
//             console.log('Watchlist retrieved');
//             const tickers = data.map(item => item.ticker);
//             const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
//             const requests = tickers.map(ticker => Promise.all([
//                 axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`),
//                 axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`)
//             ]));
    
//             Promise.all(requests)
//                 .then(responses => {
//                     const updatedData = responses.map(([profileResponse, quoteResponse]) => ({
//                         ticker: profileResponse.data.symbol,
//                         profile: profileResponse.data,
//                         quote: quoteResponse.data
//                     }));
//                     res.send(updatedData);
//                 })
//                 .catch(error => {
//                     console.error('Error:', error);
//                     res.status(500).send('An error occurred while fetching data');
//                 });
//         }).catch(err => {
//             console.error('Error retrieving watchlist:', err);
//             res.status(500).send('An error occurred while retrieving watchlist');
//         });
//     });
    

// }).catch(err => {
//     console.error('Error connecting to MongoDB:', err);
// });    

// polygonapikey = "yuwKvAiOy616Tn7Fc7a5YVd_JmOVucu2";
// `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${apiKey}`,
// f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker}&token={apikey}",
// f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={apikey}",
// f"https://finnhub.io/api/v1/stock/recommendation?symbol={ticker}&token={apikey}",
// f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{sixmonth.strftime('%Y-%m-%d')}/{today.strftime('%Y-%m-%d')}?adjusted=true&sort=asc&apiKey={polygonapikey}",
// f"https://finnhub.io/api/v1/company-news?symbol={ticker}&from={beforedate}&to={today}&token={apikey}"
    
app.get(`/api/:ticker`, (req, res) => {
    const ticker = req.params.ticker; 
    const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
    axios.get(`https://finnhub.io/api/v1/search?q=${ticker}&token=${apiKey}`)
        .then(response => {
            console.log('AutoFill Working');
            const filteredStocks = response.data.result.filter(stock => stock.type == "Common Stock" && !stock.symbol.includes('.'));
            res.send(filteredStocks);
        })
        .catch(error => {
            console.error('Error:', error);
        });   
});

app.get(`/search/:ticker`, (req, res) => {
    const ticker = req.params.ticker; 
    const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
    const today =  DateTime.now().toISODate();
    const beforeDate = DateTime.now().minus({ days: 7 }).toISODate();
    const urls = [
        `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${beforeDate}&to=${today}&token=${apiKey}`
    ];

    const requests = urls.map(url => axios.get(url)); 
    Promise.all(requests)
        .then(responses => {
            const responseData = responses.map(response => response.data);
            console.log('Search Working');
            const filteredNews = responseData[3].filter(article => article.image && article.image !== "");
            responseData[3] = filteredNews.slice(0, 20);
            res.send(responseData); 
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('An error occurred while fetching data');
        });
});

app.get(`/charts/:ticker`, (req, res) => {
    const ticker = req.params.ticker; 
    polygonapikey = "yuwKvAiOy616Tn7Fc7a5YVd_JmOVucu2";
    const today = DateTime.now().toISODate();
    const sixmonth = DateTime.now().minus({ months: 6 }).toISODate();

    urls = [
     `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${sixmonth}/${today}?adjusted=true&sort=asc&apiKey=${polygonapikey}`,
    ];
    const requests = urls.map(url => axios.get(url));
    Promise.all(requests)
        .then(responses => {
            const responseData = responses.map(response => response.data);
            console.log('Charts Working');
            console.log(responseData);
            res.send(responseData);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('An error occurred while fetching data');
        });
        
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})




