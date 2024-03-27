import React, { useEffect, useState } from 'react';
import './Portfolio.css'
import { Card } from 'react-bootstrap';

function Portfolio() {
  const [watchData, setData] = useState(null);

  return (
    <div className='portfolio'>
      <div className='port'>
        <h2>My Portfolio</h2>
        <p>Money in Wallet: ${}</p>
        {watchData && watchData.length > 0 ? (
          watchData.map((data, index) => (
            <Card key={index} style={{ width: '850px', marginBottom: '10px' }}>
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
          <div className='NoData'>Currently you don't have any stock</div>
        )}
      </div>
    </div>
  )
}

export default Portfolio