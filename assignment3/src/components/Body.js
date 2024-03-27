import './Body.css';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import SearchResults from './Search';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function Body() {
    const { sendtick } = useParams();
    const [ticker, setTicker] = useState(sendtick ||'');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [options, setOptions] = useState([]);
    const [sendticker, sendTicker] = useState(sendtick ||'');
    const navigate = useNavigate();
    // const [selectedOption, setSelectedOption] = useState(null);

    const fetchData = async (ticker) => {
        if (ticker !== '') {
            try {
                const response = await fetch(`http://localhost:8000/api/${ticker}`);
                if (!response.ok) {
                    throw new Error('Ticker not found.');
                }
                const jsonData = await response.json();
                setData(jsonData);
                setError(null);
                console.log('this is fetch data', jsonData);
            } catch (error) {
                console.error('Error fetching ticker details:', error);
                setError('Ticker not found');
                setData(null);
            }
        } else {
            setError(null);
            setData(null);
        }
    };

    useEffect(() => {
        console.log('running')
        const fetchOptions = async (ticker) => {
            try {
                if (ticker !== '') {
                    const response = await fetch(`http://localhost:8000/api/${ticker}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch stock names.');
                    }
                    const jsonData = await response.json();
                    console.log(jsonData)
                    setOptions(jsonData.map(item => ({
                        value: `${item.symbol.toString()} | ${item.description.toString()}`
                    })));
                } else {
                    setOptions([]);
                }
            } catch (error) {
                console.error('Error fetching stock names:', error);
            }
        };
        fetchOptions(ticker);
        localStorage.setItem('ticker', sendticker);
    }, [ticker]);

    // const renderOption = (option, { index, isHighlighted, isSelected }) => {
    //     const isSelectedOption = selectedOption && option.value === selectedOption.value;
    //     return (
    //         <div className={`option ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}>
    //             {option.value}
    //             {isSelectedOption && <FontAwesomeIcon icon={faCheck} className="tick-icon" />}
    //         </div>
    //     );
    // };

    const handleTickerSelection = (selected) => {
        const symbol = selected[0].value.split(' ')[0];
        sendTicker(symbol);
        // setSelectedOption(selected[0]);
        fetchData(symbol);
        navigate(`/search/${ticker.toUpperCase()}`);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchData(ticker);
        sendTicker(ticker);
        console.log('this is on submit check this')
        navigate(`/search/${ticker.toUpperCase()}`);
    };

    return (
        <div className="body-container">
            <div className="text-and-search">
                <p>Stock Search</p>
                <div className="search-container">
                    <form onSubmit={handleSubmit} className="form-submit">
                        <Typeahead
                            id="search"
                            type="text"
                            placeholder="Enter stock ticker symbol"
                            labelKey="value"
                            onInputChange={setTicker}
                            onChange={handleTickerSelection}
                            options={options}
                            className="typeahead"
                            emptyLabel={ticker ? (
                                <Spinner animation="border" role="status" className='spinner'>
                                    <span className="sr-only">Loading...</span>
                                </Spinner>
                            ) : null}
                        >
                        </Typeahead>

                        <button className="search-icon" type="submit">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <button className="clear-icon" onClick={() => {
                            setTicker('');
                            setError(null);
                            setData(null);
                            setOptions([]);
                            navigate(`/search/home`);
                            // if (typeaheadRef.current) {
                            //     typeaheadRef.current.clear();
                            // }
                        }}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </form>
                </div>
            </div>
            <div className="results">
                {error && <p>{error}</p>}
                {sendticker && (
                    <SearchResults ticker={sendticker} />
                )}
            </div>
        </div>
    );
}

export default Body;
