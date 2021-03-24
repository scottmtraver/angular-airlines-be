const envvars = require('dotenv').config().parsed

const express = require('express')
const app = express()
const port = 3000

const axios = require('axios')

// Redis Configuration
const redis = require("redis");
const client = redis.createClient();

app.use(express.json())

app.get('/info', (req, res) => {
    // process.env.DB_HOST,
    console.log(envvars)
    res.send('Hello World!')
})

app.post('/purchase', (req, res) => {
    console.log(req.body)

    const token = Buffer.from(`${envvars.SPREEDLY_ENVIRONMENT}:${envvars.SPREEDLY_SECRET}`, 'utf8').toString('base64')
    axios
        .post(`${envvars.SPREEDLY_URL}/gateways/${envvars.SPREEDLY_GATEWAY}/purchase.json`,
            {

                transaction: {
                    payment_method_token: "DJzMa2rOjrB8MKJVq67YKC9tKTI",
                    amount: 10000,
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

    // client.set("key", "value", redis.print);
    // client.get("key", redis.print);
    // res.send('purchased')
})

app.listen(port, () => {
    console.log(`Airlines API on http://localhost:${port}`)
})