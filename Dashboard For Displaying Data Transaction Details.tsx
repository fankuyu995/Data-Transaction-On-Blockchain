import { useEffect } from 'react'
import NavBar from './navbar'
import React from 'react';
import { Bar } from 'react-chartjs-2';
import Head from 'next/head'
import { CategoryScale, LinearScale, ChartOptions, BarElement, ChartType, } from 'chart.js';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import ChartJS from 'chart.js/auto';
import { groupBy } from 'lodash';
import ChartOption from 'chart.js/auto';
import { ethers } from 'ethers';
import abi from "../src/data_transaction.json"
import { contractAddress } from '@/src/address';





ChartJS.register(CategoryScale, LinearScale)

interface data {
  name: string;
  price: number;
  category: string;
  date: string;
}

interface BarChartOptions extends ChartOptions {
  height?: number;
  width?: number;
}

const data = [
  { date: '2023-04-01', price: '$10.00', category: 'Fashion', name: 'Shirt' },
  { date: '2023-04-02', price: '$15.00', category: 'Electronics', name: 'Phone' },
  { date: '2023-04-03', price: '$12.50', category: 'Home & Garden', name: 'Plant' },
  { date: '2023-04-04', price: '$8.75', category: 'Fashion', name: 'Pants' },
  { date: '2023-04-05', price: '$21.00', category: 'Home & Garden', name: 'Lawnmower' },
  { date: '2023-04-06', price: '$16.50', category: 'Electronics', name: 'Tablet' },
  { date: '2023-04-07', price: '$9.25', category: 'Fashion', name: 'Hat' },
  { date: '2023-04-08', price: '$18.00', category: 'Home & Garden', name: 'Chair' },
  { date: '2023-04-09', price: '$14.50', category: 'Electronics', name: 'Laptop' },
  { date: '2023-04-10', price: '$11.00', category: 'Fashion', name: 'Shoes' },
];



export default function Dashboard() {

  const [address, setAddress] = useState<string>();
  const [transaction, setTransaction] = useState<any[]> ([]);


  useEffect(() => {

    async function transactiondetails() {
          try {
            const address = sessionStorage.getItem("wallet");
            console.log("address", address)
            if (address) {
              setAddress(address);
            }

            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const dataExchange = new ethers.Contract(
              contractAddress,
              abi.abi,
              provider
            )
            
            const dataResult = await dataExchange.view_raw_data_id_list();
            const dataMap = await dataExchange.data_map

            console.log("DataResult: ", dataResult)
            console.log("DataMap: ", dataMap)
            console.log("DataExchange", dataExchange)

            const transaction = await dataExchange.view_buyer_purchase(address)
            console.log("Transaction: ", transaction)
            setTransaction(transaction);
            //const myVariable = "Hello, world!";
            //return myVariable;

          } catch (err) {
            console.log("TransactionDetailsError", err)
          }

      }
      transactiondetails()
    },
  );
  
  transaction

  const rows = data.map((item, index) => (
    <TableRow key={index}>
      <TableCell align="center">{item.date}</TableCell>
      <TableCell align="center">{item.price}</TableCell>
      <TableCell align="center">{item.category}</TableCell>
      <TableCell align="center">{item.name}</TableCell>
    </TableRow>
  ));

  const categories = Array.from(new Set(data.map(item => item.category)));
  const categoryTotals = groupBy(data, 'category');
  const categorySums = categories.map(category => {
    const items = categoryTotals[category];
    const sum = items.reduce((total, item) => total + Number(item.price.replace('$', '')), 0);
    return sum.toFixed(2);
  });

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Total Price',
        data: categorySums,
        backgroundColor: '#3f51b5',
      },
    ],
  };

  const options: any = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Category',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Price',
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
    height: 300,
    width: 500,
  };


  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <NavBar />
      <Typography variant="h1" align="center">Dashboard{}</Typography>
      <Typography variant="h4" align="center">Total number of purchase: {rows.length}</Typography>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab label="Past consumption" />
        <Tab label="Graph" />
      </Tabs>
      {currentTab === 0 && (
        <Table size="medium">
          <TableHead>
            <TableRow style={{ backgroundColor: '#ccc', color: '#333', fontWeight: 'bold', border: '1px solid #999' }}>
              <TableCell style={{ padding: '10px', textAlign: 'center' }}>Dataset</TableCell>
              <TableCell style={{ padding: '10px', textAlign: 'center' }}>Price(In Wei)</TableCell>
              <TableCell style={{ padding: '10px', textAlign: 'center' }}>Categories</TableCell>
              <TableCell style={{ padding: '10px', textAlign: 'center' }}>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      )}
      {currentTab === 1 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>Total Consumptions by Category</Typography>
          <Bar data={chartData} options={options} />
        </Box>
      )}
    </Box>
  );
};
