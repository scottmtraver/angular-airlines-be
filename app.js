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
    console.log(envvars)
    res.send('Logged env vars to server')
})

app.get('/flights', (req, res) => {
    res.send(data)
})

app.get('/flights/:id/', function (req, res) {
    const flight = data.filter(x => x.id == req.params.id)[0]
    res.send(flight)
})

app.post('/purchase', (req, res) => {
    const price = Number(`${data.find(f => f.id == req.body.flightId).price}00`)

    const token = Buffer.from(`${envvars.SPREEDLY_ENVIRONMENT}:${envvars.SPREEDLY_SECRET}`, 'utf8').toString('base64')
    axios
        .post(`${envvars.SPREEDLY_URL}/gateways/${envvars.SPREEDLY_GATEWAY}/purchase.json`,
            {

                transaction: {
                    payment_method_token: req.body.token,
                    amount: price,
                    currency_code: "USD",
                    retain_on_success: !!req.body.keepCC
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${token}`
                },
            }
        )
        .then(purchaseResponse => {
            if (!req.body.keepCC) {
                // remove the payment method in a background call
                axios
                    .put(`${envvars.SPREEDLY_URL}/payment_method/${req.body.token}/redact.json`,
                        {
                            headers: {
                                'Authorization': `Basic ${token}`
                            },
                        }
                    )
            }
            res.send({ success: true, message: 'Purchase Success' })
        })
        .catch(error => {
            res.send({ success: false, message: 'Purchase Failure' })
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
            res.send({ success: true, message: 'Passthrough Success' })
        })
        .catch(error => {
            res.send({ success: false, message: 'Passthrough Failure' })
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
            res.send(transactionResponse.data.transactions)
        })
        .catch(error => {
            res.send({ success: false, message: 'Could not list transactions' })
        })
})

app.listen(port, () => {
    console.log(`Airlines API on http://localhost:${port}`)
})