const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 8080;
const { DateTime } = require('luxon');
const {MongoClient} = require('mongodb');


app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://vhpatel:jnfpeM3AUn4okfmv@cluster0.zqi0e9c.mongodb.net/assignment_3';

let db;
const client = new MongoClient(uri);

client.connect().then(() => {
    console.log('Connected to MongoDB');
    db = client.db('assignment_3');
    const money = db.collection('Money');
    const watchlist = db.collection('Watchlist');
    const portfolio = db.collection('Portfolio');

// Money 
    app.get('/money', (req, res) => {
        money.find().toArray().then(data => {
            console.log('Money retrieved');
            res.send(data);
        }).catch(err => {
            console.error('Error retrieving money:', err);
            res.status(500).send('An error occurred while retrieving money');
        });
    });

    //Portfolio
    app.post('/portfolio/sell', (req, res) => {
        const ticker = req.body.ticker;
        const quantity = Number(req.body.quantity);
        const price = req.body.price;
        const name = req.body.name;
        const totalCost = quantity * price;
    
        portfolio.findOne({ ticker })
            .then(existingEntry => {
                if (!existingEntry) {
                    return res.status(400).send('Ticker not found in portfolio');
                }
    
                if (existingEntry.quantity < quantity) {
                    return res.status(400).send('Not enough quantity in portfolio');
                }
    
                const updatedQuantity = (existingEntry.quantity - quantity);
                const updatedTotalCost = existingEntry.totalCost - totalCost;
    
                if (updatedQuantity === 0) {
                    // Remove the portfolio entry if quantity becomes zero
                    portfolio.deleteOne({ ticker })
                        .then(() => {
                            console.log('Ticker removed from portfolio');
                        })
                        .catch(err => {
                            console.error('Error removing ticker from portfolio:', err);
                            return res.status(500).send('An error occurred while removing ticker from portfolio');
                        });
                } else {
                    // Update the portfolio entry
                    portfolio.updateOne({ ticker }, { $set: { quantity: updatedQuantity, totalCost: updatedTotalCost } })
                        .then(() => {
                            console.log('Portfolio entry updated');
                        })
                        .catch(err => {
                            console.error('Error updating portfolio entry:', err);
                            return res.status(500).send('An error occurred while updating portfolio entry');
                        });
                }
    
                // Add the money back to the wallet
                money.findOne({})
                    .then(data => {
                        const currentMoney = data.money;
                        const updatedMoney = currentMoney + totalCost;
    
                        money.updateOne({}, { $set: { money: updatedMoney } })
                            .then(() => {
                                console.log('Money added back to wallet');
                                // Send back updated money amount as JSON response
                                res.status(200).json({ money: updatedMoney });
                            })
                            .catch(err => {
                                console.error('Error adding money back to wallet:', err);
                                return res.status(500).send('An error occurred while adding money back to wallet');
                            });
                    })
                    .catch(err => {
                        console.error('Error fetching money:', err);
                        return res.status(500).send('An error occurred while fetching money');
                    });
            })
            .catch(err => {
                console.error('Error checking portfolio for existing entry:', err);
                return res.status(500).send('An error occurred while checking portfolio for existing entry');
            });
    });

    app.post('/portfolio/buy', (req, res) => {
        const ticker = req.body.ticker;
        const quantity = Number(req.body.quantity);
        const price = req.body.price;
        const name = req.body.name;
        const totalCost = quantity * price;

        money.findOne({})
            .then(data => {
            const currentMoney = data.money;
            if (currentMoney < totalCost) {
                return res.status(400).send('Not enough money in wallet');
            }

            money.updateOne({}, { $set: { money: currentMoney - totalCost } })
                .then(() => {
                console.log('Money deducted from wallet');
                })
                .catch(err => {
                console.error('Error deducting money from wallet:', err);
                return res.status(500).send('An error occurred while deducting money from wallet');
                });
            })
            .catch(err => {
            console.error('Error fetching money:', err);
            return res.status(500).send('An error occurred while fetching money');
            });

        portfolio.findOne({ ticker })
            .then(existingEntry => {
                if (existingEntry) {
                    const updatedQuantity = (existingEntry.quantity + quantity);
                    const updatedTotalCost = (existingEntry.totalCost + totalCost);

                    // Update the portfolio entry
                    portfolio.updateOne({ ticker }, { $set: { quantity: updatedQuantity, totalCost: updatedTotalCost } })
                        .then(() => {
                            console.log('Portfolio entry updated');
                            res.sendStatus(200);
                        })
                        .catch(err => {
                            console.error('Error updating portfolio entry:', err);
                            res.status(500).send('An error occurred while updating portfolio entry');
                        });
                } else {
                    portfolio.insertOne({ ticker,name,quantity, totalCost })
                        .then(() => {
                            console.log('Ticker added to portfolio');
                            res.sendStatus(200);
                        })
                        .catch(err => {
                            console.error('Error adding ticker to portfolio:', err);
                            res.status(500).send('An error occurred while adding ticker to portfolio');
                        });
                }
            })
            .catch(err => {
                console.error('Error checking portfolio for existing entry:', err);
                res.status(500).send('An error occurred while checking portfolio for existing entry');
            });
    });

    // Portfolio fetch
    app.get('/portfolio/get', (req, res) => {
        portfolio.find().toArray().then(data => {
            console.log('Portfolio retrieved');
            const tickers = data.map(item => item.ticker);
            const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
            const requests = tickers.map(ticker => axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`));

            Promise.all(requests)
                .then(responses => {
                    const updatedData = responses.map((response, index) => ({
                        ...data[index],
                        quote: response.data
                    }));
                    res.send(updatedData);
                })
                .catch(error => {
                    console.error('Error:', error);
                    res.status(500).send('An error occurred while fetching data');
                });
        }).catch(err => {
            console.error('Error retrieving portfolio:', err);
            res.status(500).send('An error occurred while retrieving portfolio');
        });
    });

    // Watchlist add
    app.post('/watchlist/post', (req, res) => {
        const ticker = req.body.ticker;
        if (!ticker) {
            return res.status(400).send('Ticker is required');
        }

        watchlist.insertOne({ ticker })
            .then(() => {
                console.log('Ticker added to watchlist');
                res.sendStatus(200);
            })
            .catch(err => {
                console.error('Error adding ticker to watchlist:', err);
                res.status(500).send('An error occurred while adding ticker to watchlist');
            });
    });

    // Watchlist remove
    app.get('/watchlist/remove/:ticker', (req, res) => {
        const ticker = req.params.ticker;
        watchlist.deleteOne({ ticker })
            .then(() => {
                console.log('Ticker removed from watchlist');
                res.sendStatus(200);
            })
            .catch(err => {
                console.error('Error removing ticker from watchlist:', err);
                res.status(500).send('An error occurred while removing ticker from watchlist');
            });
    });

    // Watchlist fetch 
    app.get('/watchlist/get', (req, res) => {

        watchlist.find().toArray().then(data => {
            console.log('Watchlist retrieved');
            const tickers = data.map(item => item.ticker);
            const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
            const requests = tickers.map(ticker => Promise.all([
                axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`),
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`)
            ]));
    
            Promise.all(requests)
                .then(responses => {
                    const updatedData = responses.map(([profileResponse, quoteResponse]) => ({
                        ticker: profileResponse.data.symbol,
                        profile: profileResponse.data,
                        quote: quoteResponse.data
                    }));
                    res.send(updatedData);
                })
                .catch(error => {
                    console.error('Error:', error);
                    res.status(500).send('An error occurred while fetching data');
                });
        }).catch(err => {
            console.error('Error retrieving watchlist:', err);
            res.status(500).send('An error occurred while retrieving watchlist');
        });
    });
    

}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});    
   
// Autofill 
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

// Search Page
app.get(`/search/:ticker`, (req, res) => {
    const ticker = req.params.ticker; 
    const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
    const today =  DateTime.now().toISODate();
    let watch = false;
    let portfolio = false;
    const beforeDate = DateTime.now().minus({ days: 7 }).toISODate();
    const urls = [
        `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${beforeDate}&to=${today}&token=${apiKey}`,
        `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=2022-01-01&token=${apiKey}`,
        `https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${apiKey}`
    ];

    const requests = urls.map(url => axios.get(url)); 
    Promise.all(requests)
        .then(responses => {
            const responseData = responses.map(response => response.data);
            console.log('Search Working');
            const filteredNews = responseData[3].filter(article => article.image && article.image !== "");
            responseData[3] = filteredNews.slice(0, 20);
            
            db.collection('Watchlist').findOne({ ticker })
                .then(data => {
                    watch = data ? true : false;
                    db.collection('Portfolio').findOne({ ticker })
                        .then(data => {
                            portfolio = data ? true : false;
                            res.send({ ...responseData, watch, portfolio });
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            res.status(500).send('An error occurred while fetching data');
                        });
                })
                .catch(error => {
                    console.error('Error:', error);
                    res.status(500).send('An error occurred while fetching data');
                });
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('An error occurred while fetching data');
        });    
});

// Charts 
app.get(`/charts/:ticker`, (req, res) => {

    const ticker = req.params.ticker; 
    polygonapikey = "yuwKvAiOy616Tn7Fc7a5YVd_JmOVucu2";
    const today = DateTime.now().toISODate();
    const twoyears = DateTime.now().minus({ years: 2 }).toISODate();

    url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${twoyears}/${today}?adjusted=true&sort=asc&apiKey=${polygonapikey}`;
    
    axios.get(url)
        .then(response => {
            const responseData = response.data;
            console.log('Charts Working');
            res.send(responseData);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('An error occurred while fetching data');
        });
        
});

app.get(`/charts/summary/:ticker/`, async (req, res) => {

    let marketCloseStatus;
    let check;
    const ticker = req.params.ticker; 
    const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
    const url_fin = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
    
    const response = await axios.get(url_fin)
    const responseData = response.data;
    const now = DateTime.now();
    check = responseData.t;
    marketCloseStatus = check < now;

    polygonapikey = "yuwKvAiOy616Tn7Fc7a5YVd_JmOVucu2";
    const today = DateTime.now().toISODate();
    let yesterday = DateTime.now().minus({ day: 1 }).toISODate();
    console.log("Yesterday: ",yesterday,"Check: ",check,"marketclosed: ",marketCloseStatus);
    if (!marketCloseStatus) {
        yesterday = check.minus({ day: 1 }).toISODate(); 
    }
    console.log(yesterday);

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/hour/${yesterday}/${today}?adjusted=true&sort=asc&apiKey=${polygonapikey}`;

    await axios.get(url)
        .then(response => {
            const responseData = response.data;
            console.log('Charts Working');
            res.send(responseData);
        })
        .catch(error => {
            // console.error('Error:', error);
            res.status(500).send('An error occurred while fetching data');
        });
        
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})




