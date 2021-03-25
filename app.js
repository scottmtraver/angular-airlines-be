const envvars = require('dotenv').config().parsed

const express = require('express')
const app = express()
const port = 3000

const axios = require('axios')

var cors = require('cors')

app.use(cors())

// Redis Configuration
const redis = require("redis");
const client = redis.createClient();

// Sample Data
const data = [
    { id: 1, source: 'Anchorage', dest: 'Salt Lake City', price: 120 },
    { id: 2, source: 'Seattle', dest: 'Denver', price: 220 },
    { id: 3, source: 'Portland', dest: 'Boise', price: 20 },
    { id: 4, source: 'Brisbane', dest: 'Los Angles', price: 80 },
    { id: 5, source: 'Walla Walla', dest: 'Las Vegas', price: 50 }
];

app.use(express.json())

app.get('/info', (req, res) => {
    // process.env.DB_HOST,
    console.log(envvars)
    res.send('Hello World!')
})

app.get('/flights', (req, res) => {
    res.send(JSON.stringify(data))
})

app.get('/flights/:id/', function (req, res) {
    const flight = data.filter(x => x.id == req.params.id)[0]
    res.send(JSON.stringify(flight))
})

app.post('/purchase', (req, res) => {
    console.log(req.body)

    const price = Number(`${data.find(f => f.id == req.body.flightId).price}00`)

    const token = Buffer.from(`${envvars.SPREEDLY_ENVIRONMENT}:${envvars.SPREEDLY_SECRET}`, 'utf8').toString('base64')
    axios
        .post(`${envvars.SPREEDLY_URL}/gateways/${envvars.SPREEDLY_GATEWAY}/purchase.json`,
            {

                transaction: {
                    payment_method_token: req.body.token,
                    amount: price,
                    currency_code: "USD",
                    retain_on_success: true
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${token}`
                },
            }
        )
        .then(purchaseResponse => {
            console.log(`statusCode: ${purchaseResponse.statusCode}`)
            console.log(purchaseResponse)
            res.send('Purchase OK')
        })
        .catch(error => {
            console.error(error)
            res.send('Purchase FAILED')
        })
})

app.post('/passthrough', (req, res) => {

    const token = Buffer.from(`${envvars.SPREEDLY_ENVIRONMENT}:${envvars.SPREEDLY_SECRET}`, 'utf8').toString('base64')
    axios
        .post(`${envvars.SPREEDLY_URL}/receivers/${envvars.SPREEDLY_RECEIVER}/deliver.json`,
        {
            "delivery": {
              "payment_method_token": req.body.token,
              "url": "https://spreedly-echo.herokuapp.com",
              "headers": "Content-Type: application/json",
              "body": `{ \"product_id\": \"${req.body.flightId}\", \"card_number\": \"{{credit_card_number}}\" }`
            }
          },
            {
                headers: {
                    'Authorization': `Basic ${token}`
                },
            }
        )
        .then(purchaseResponse => {
            console.log(`statusCode: ${purchaseResponse.statusCode}`)
            console.log(purchaseResponse)
            res.send('Passthrough Success')
        })
        .catch(error => {
            console.error(error)
            res.send('Passthrough FAILED')
        })
})

app.get('/transactions', (req, res) => {

    const token = Buffer.from(`${envvars.SPREEDLY_ENVIRONMENT}:${envvars.SPREEDLY_SECRET}`, 'utf8').toString('base64')
    axios
        .get(`${envvars.SPREEDLY_URL}/transactions.json?order=desc`,
            {
                headers: {
                    'Authorization': `Basic ${token}`
                },
            }
        )
        .then(transactionResponse => {
            console.log(`statusCode: ${transactionResponse.statusCode}`)
            res.send(transactionResponse.data.transactions)
        })
        .catch(error => {
            console.error(error)
            res.send('Could not get transactions')
        })
})

app.listen(port, () => {
    console.log(`Airlines API on http://localhost:${port}`)
})