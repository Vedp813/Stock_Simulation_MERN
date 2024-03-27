import React, { useEffect, useState } from 'react';
import './watchlist.css';
import { Card } from 'react-bootstrap';



function Watchlist() {
  const [watchData, setData] = useState(null);

 

  const removeData = (ticker) => {
    fetch(`http://localhost:8000/watchlist/remove/${ticker}`)
      .then(response => response.text())
      .then(() => {
        console.log('Ticker removed from watchlist');
        // Call the server-side code to remove the ticker from the watchlist
        // You can handle the response from the server if needed
      })
      .catch(error => console.log(error));
  }

  useEffect(() => {
    
      fetch('http://localhost:8000/watchlist/get')
        .then(response => response.json())
        .then(data => setData(data))
        .catch(error => console.log(error));
  });

  return (
    <div className='watchlist'>
      <div className='watch'>
        <h2>My Watchlist</h2>
        {watchData && watchData.length > 0 ? (
          watchData.map((data, index) => (
            <Card key={index} style={{ width: '850px', marginBottom: '10px' }}>
              <span className="close-icon" onClick={() => removeData(data['profile']['ticker'])}>&times;</span>
              <Card.Body>
                <div className='first-col-watch'>
                  <Card.Title>{data['profile']['ticker']}</Card.Title>
                  <Card.Text>{data['profile']['name']}</Card.Text>
                </div>
                <div className='second-col-watch'>
                  <Card.Text style={{ color: data['quote']['d'] > 0 ? 'green' : 'red', fontWeight: '600', fontSize: '18px' }}>{data['quote']['c']}</Card.Text>
                  <Card.Text style={{ color: data['quote']['d'] > 0 ? 'green' : 'red' }}>{data['quote']['d'].toFixed(2)} ({data['quote']['dp'].toFixed(2)}%)</Card.Text>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <div className='NoData'>Currently you don't have any stock in your watchlist.</div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;

