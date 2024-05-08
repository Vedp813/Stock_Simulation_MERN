import React, { useEffect, useState } from 'react';
import './Watchlist.css';
import { Card } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';

function Watchlist() {
  const [watchData, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchRemove, setRemove] = useState(false);
  const navigate = useNavigate();

  const fetchWatchlist = async () => {
    fetch('https://assignment3-webtech-csci571.wl.r.appspot.com/watchlist/get')
        .then(response => response.json())
        .then(data => setData(data))
        .catch(error => console.log(error));
  }

 

  const removeData = (ticker) => {
    fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/watchlist/remove/${ticker}`)
      .then(response => response.text())
      .then(() => {
        console.log('Ticker removed from watchlist');
        setRemove(!watchRemove);
        // Call the server-side code to remove the ticker from the watchlist
        // You can handle the response from the server if needed
      })
      .catch(error => console.log(error));
  };

  useEffect(() => {
    fetchWatchlist();
  }, [watchRemove]);

  useEffect(() => {
    if (watchData) {
      setLoading(false);
    }
  }, [watchData]);

  return (
    <div className='watchlist'>
      <div className='watch'>
        <h2>My Watchlist</h2>
        {loading ? (
          <div className='spinner-container-watchlist'>
          <Spinner animation='border' role='status'>
            <span className='sr-only'></span>
          </Spinner>
        </div>
        ) : watchData && watchData.length > 0 ? (
          watchData.map((data, index) => (
            <Card key={index} style={{ width: '85%', marginBottom: '10px' }}>
              <span className="close-icon-watchlist" onClick={() => removeData(data['profile']['ticker'])}>&times;</span>
              <Card.Body>
                <div className='first-col-watch' onClick={() =>{navigate(`/search/${data['profile']['ticker'].toUpperCase()}`);}}>
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
          <div className='NoData-watchlist'>Currently you don't have any stock in your watchlist.</div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;

