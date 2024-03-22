const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());

// polygonapikey = "yuwKvAiOy616Tn7Fc7a5YVd_JmOVucu2";
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
            res.send(response.data);
        })
        .catch(error => {
            console.error('Error:', error);
        });   
});

app.get(`/search/:ticker`, (req, res) => {
    const ticker = req.params.ticker; 
    const apiKey = 'cn607fhr01qo3qc0d34gcn607fhr01qo3qc0d350';
    const urls = [
        `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${apiKey}`,
        `https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${apiKey}`,
        // Add more URLs here if needed
    ];

    const requests = urls.map(url => axios.get(url)); 
    Promise.all(requests)
        .then(responses => {
            const responseData = responses.map(response => response.data);
            console.log('Search Working');
            res.send(responseData); 
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('An error occurred while fetching data');
        });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

