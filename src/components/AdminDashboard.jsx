import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = ({ token, setLoggedIn, handleLogout }) => {
  const [restoName, setRestoName] = useState('');
  const [restoLocation, setRestoLocation] = useState('');
  const [chargeCustomers, setChargeCustomers] = useState(false);
  const [customAmount, setCustomAmount] = useState(0);
  const [regularAmounts, setRegularAmounts] = useState([]);
  const [showGraph, setShowGraph] = useState(true);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const chartRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('https://stg.dhunjam.in/account/admin/4', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseData = response.data.data;

      setRestoName(responseData.name);
      setRestoLocation(responseData.location);
      setChargeCustomers(responseData.charge_customers);
      setCustomAmount(responseData.amount.category_6);
      setRegularAmounts([
        responseData.amount.category_7,
        responseData.amount.category_8,
        responseData.amount.category_9,
        responseData.amount.category_10,
      ]);

      setShowGraph(responseData.charge_customers);
      renderGraph(responseData.charge_customers, responseData.amount.category_6, [
        responseData.amount.category_7,
        responseData.amount.category_8,
        responseData.amount.category_9,
        responseData.amount.category_10,
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, setLoggedIn]);

  const renderGraph = (chargeCustomers, customAmount, regularAmounts) => {
    if (chargeCustomers) {
      if (chartRef.current !== null) {
        chartRef.current.destroy();
      }
      const ctx = document.getElementById('myChart');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Category 6', 'Category 7', 'Category 8', 'Category 9', 'Category 10'],
            datasets: [{
              label: 'Song Requests',
              backgroundColor: 'F0C3F1',
              data: [customAmount, ...regularAmounts],
            }],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    } else {
      setShowGraph(false);
    }
  };

  const handleCustomAmountChange = (event) => {
    const amount = parseInt(event.target.value, 10);
    setCustomAmount(amount);
    setSaveDisabled(amount <= 99);
    renderGraph(chargeCustomers, amount, regularAmounts);
  };

  const handleRegularAmountChange = (event, index) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      const updatedAmounts = regularAmounts.map((amount, i) => {
        if (i === index) {
          return value;
        }
        return amount;
      });

      setRegularAmounts(updatedAmounts);

      const requiredValues = [79, 59, 39, 19];
      const allAboveRequired = updatedAmounts.every((amount, idx) => amount > requiredValues[idx]);

      setSaveDisabled(!allAboveRequired || customAmount <= 99);

      renderGraph(chargeCustomers, customAmount, updatedAmounts);
    }
  };

  const updatePrice = async () => {
    try {
      const response = await axios.put(
        'https://stg.dhunjam.in/account/admin/4',
        {
          amount: {
            category_6: customAmount,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = response.data.data;
      console.log('Updated Price Response: ', responseData);

      fetchDashboardData();
      setAlertMessage('Values updated successfully!');
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating price:', error);
      setAlertMessage('Failed to update values.');
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    }
  };

  const handleSaveClick = () => {
    if (!saveDisabled) {
      updatePrice();
    }
  };

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-header">{restoName}<span>, </span>{restoLocation}</h1>
      <div className="radio-container">
        <label >
          Do you want to charge your customers for requesting songs?
          <input
            type="radio"
            value="yes"
            checked={chargeCustomers === true}
            onChange={(e) => setChargeCustomers(e.target.value === 'yes')}
          />{' '}
          Yes
        </label>
        <label>
          <input
            type="radio"
            value="no"
            checked={chargeCustomers === false}
            onChange={(e) => setChargeCustomers(e.target.value === 'yes')}
          />{' '}
          No
        </label>
      </div>
      {chargeCustomers && (
        <div className="song-request-form">
          <label>Custom Song Request Amount:</label>
          <input className='input_field_s2' type="number" value={customAmount} onChange={handleCustomAmountChange} />
          <br />

          <label>Regular Song Request Amounts:</label>
          {regularAmounts.map((amount, index) => (
            <div className='amount_value' key={index}>
              <input className='input_field_s2' type="number" value={amount} onChange={(e) => handleRegularAmountChange(e, index)} />
              <br />
            </div>
          ))}
        </div>
      )}
      {showGraph && <canvas id="myChart" className="graph-container" width="600" height="400"></canvas>}

      <div>
      <button className="save_btn" onClick={handleSaveClick} disabled={saveDisabled}>
            Save
          </button>
          {/* <button className='btn_s2' onClick={handleLogout}>Logout</button> */}
          {alertMessage && <div className={`alert-message ${alertMessage.includes('Failed') ? 'failed' : 'success'}`}>{alertMessage}</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;
