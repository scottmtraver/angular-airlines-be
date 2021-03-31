# Angular Airlines Backend

This project is to demonstrate some of the Spreedly API functionality. Works in tandem with https://github.com/scottmtraver/angular-airlines-fe Angular Frontend and Spreedly Express


## Development server

Install the required JS packages with `npm install`

Create a `.env` file in the root of the project and use the sample_env template to fill our your Spreedly specifics

Run the server localhost:3000 with `node app.js`

## API

There are five primary endpoints (localhost:3000/)

 - /info - GET - will log the env vars to the background server process console
 - /flights - GET - returns all flights from the test dataset
 - /flight/{id | Number} - GET - returns a specific flight
 - /purchase - POST params `{ flightId: number, token: string, keepCC?: boolean }`
 This method purchases using token (payment method token) against the registered gateway in `.env`. Returns `{ success: boolean, message: string }`
 - /passthrough - POST params `{ flightId: number, token: string }` This method purchases using token (payment method token) against the receiver registered in `.env`. Returns `{ success: boolean, message: string }`
 - /transactions - GET - returns all the transactions for this environment (paginated per spreedly* pagination not implement in frontend)