import React, { useState, useEffect } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import axios from 'axios';
import {
  Button,
  Grid,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  AppBar,
  Typography,
  Paper
} from '@material-ui/core';
import ExposureIcon from '@material-ui/icons/Exposure';
import { useStyles } from './styles/styles';
import configCurrencyList from './config/config';

function App() {
  const [ apiData, setApiData ] = useState([]);
  const [ currencyList, setCurrencyList ] = useState([ configCurrencyList ]);
  const [ currencyInput, setCurrencyInput ] = useState('');
  const [ outputCurrencyIndex, setOutputCurrencyIndex ] = useState(0);
  const [ filterVendorId, setFilterVendorId ] = useState('');
  const [ fileToUpload, setFileToUpload ] = useState('');
  const [ total, setTotal ] = useState('');

  const classes = useStyles();

  useEffect(
    () => {
      setTotal(calculator());
    },
    [ currencyList, outputCurrencyIndex, filterVendorId, apiData ]
  );

  useEffect(() => {
    setCurrencyList(configCurrencyList);
  }, []);

  const handleRateChange = (e, currencyName) => {
    if (!isNaN(e.target.value)) {
      const rate = e.target.value;
      const index = currencyList.findIndex((currency) => currency.name === currencyName);
      if (index !== -1) {
        const newCurrencyList = currencyList.slice();
        newCurrencyList[index] = { name: currencyName, rate };

        setCurrencyList(newCurrencyList);
      }
    }
  };

  const onCurrencyChange = (e) => {
    const currencyName = e.target.value.toUpperCase();
    if (e.target.value.length > 3 || !/^[a-zA-Z]*$/g.test(e.target.value)) {
      return;
    }
    setCurrencyInput(currencyName);
  };

  const addCurrency = () => {
    if (!currencyList.some((currency) => currency.name === currencyInput) && currencyInput.length === 3) {
      const newList = currencyList.slice();
      newList.push({
        name: currencyInput,
        rate: 1
      });
      setCurrencyList(newList);
      setCurrencyInput('');
    }
  };

  const onKeyboardAddCurrency = (e) => {
    if (e.code === 'Enter' && e.target.value.length === 3) {
      addCurrency();
    }
  };

  const onSelectOutputCurrency = (e) => {
    const currencyIndex = currencyList.findIndex((currency) => currency.name === e.target.value);
    if (currencyIndex !== -1) {
      setOutputCurrencyIndex(currencyIndex);
    }
  };

  const onSetFilter = (e) => {
    setFilterVendorId(e.target.value);
  };

  const calculator = () => {
    let invoices;
    if (filterVendorId) {
      invoices = apiData.filter((invoice) => invoice['Vat number'] === filterVendorId);
    } else {
      invoices = apiData.slice();
    }
    let total = 0;
    invoices.forEach((item) => {
      const currentCurrency = currencyList.find((currency) => currency.name === item.Currency);
      switch (item.Type) {
        case '1':
          return (total += parseFloat(item.Total / currentCurrency.rate) * currencyList[outputCurrencyIndex].rate);
        case '2':
          return (total -= parseFloat(item.Total / currentCurrency.rate) * currencyList[outputCurrencyIndex].rate);
        case '3':
          return (total += parseFloat(item.Total / currentCurrency.rate) * currencyList[outputCurrencyIndex].rate);
        default:
          throw new Error('Unknown invoice type.');
      }
    });
    return total;
  };

  const onFileSelect = (e) => {
    setFileToUpload(e[0]);
  };

  const onFileUpload = () => {
    let formData = new FormData();
    formData.append('csvfile', fileToUpload);
    axios
      .post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(
        (res) => {
          setApiData(res.data);
        },
        (err) => console.log(err)
      );
  };

  
  const makeVendorsList = () => {
    const vendorsArr = [];
    apiData.forEach((invoice) => {
      if (!vendorsArr.some((item) => item.customer === invoice.Customer)) {
        vendorsArr.push({ customer: invoice.Customer, vatNumber: invoice['Vat number'] });
      }
    });

    return vendorsArr;
  };

  const vendorsList = makeVendorsList();

  const renderVendorFilter = vendorsList.map((item) => (
    <option value={item.vatNumber} key={item.vatNumber}>
      {item.customer}
    </option>
  ));

  const renderedCurrencyList = currencyList.map((currency) => (
    <div key={currency.name}>
      <TextField
        id={currency.name}
        defaultValue={currency.rate}
        label={currency.name}
        onChange={(e) => handleRateChange(e, currency.name)}
      />
    </div>
  ));

  const renderCurrencyDropdown = currencyList.map((currency) => {
    return (
      <option key={currency.name} value={currency.name}>
        {currency.name}
      </option>
    );
  });

  return (
    <div className="App">
      <AppBar className={classes.appBar} position="static" color="primary">
        <Typography variant="h4" className={classes.title}>
        <ExposureIcon fontSize="large" style={{'vertical-align': 'text-top'}}/> Invoice Calculator
        </Typography>
      </AppBar>
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={4}>
          <Container>
            <DropzoneArea filesLimit={1} acceptedFiles={[ '.csv' ]} onChange={onFileSelect} />
            <Button
              className={classes.button}
              disabled={!fileToUpload}
              variant="contained"
              color="primary"
              onClick={onFileUpload}
            >
              Upload
            </Button>
          </Container>
        </Grid>
        {apiData.length > 0 && (
          <Grid item xs={4}>
            <Grid container>
              <Grid item xs={4}>
                <Container>{renderedCurrencyList}</Container>
              </Grid>
              <Grid item xs={4}>
                <Container>
                  <TextField
                    label="Currency"
                    value={currencyInput}
                    onChange={onCurrencyChange}
                    onKeyPress={onKeyboardAddCurrency}
                  />
                  <Button
                    className={classes.button}
                    size={'small'}
                    variant="contained"
                    color="default"
                    onClick={addCurrency}
                  >
                    Add Currency
                  </Button>
                </Container>
              </Grid>
              <Grid item xs={4}>
                <Container>
                  {currencyList.length > 0 && (
                    <FormControl variant="filled" className={classes.formControl}>
                      <InputLabel htmlFor="outputCurrency">Output currency</InputLabel>
                      <Select
                        native
                        id="outputCurrency"
                        onChange={onSelectOutputCurrency}
                        value={currencyList[outputCurrencyIndex].name}
                      >
                        {renderCurrencyDropdown}
                      </Select>
                    </FormControl>
                  )}
                  <FormControl variant="filled" className={classes.formControl}>
                    <InputLabel htmlFor="outputCurrency">Filter by vendor</InputLabel>
                    <Select native id="Filter by vendor" onChange={onSetFilter} value={filterVendorId}>
                      <option value="" />
                      {renderVendorFilter}
                    </Select>
                  </FormControl>
                </Container>
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid item xs={4}>
          {apiData.length > 0 && (
            <Container>
              <Typography variant="caption" color="textPrimary">
                Total:
              </Typography>
              <Paper className={classes.paper}>
                <Typography variant="h3" className={classes.title} color="primary">
                  {total} {currencyList[outputCurrencyIndex].name}
                </Typography>
              </Paper>
            </Container>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
