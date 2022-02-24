const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const sqlite3 = require("sqlite3");
app.use(express.json());

// datbase connection
const db = new sqlite3.Database('./db.sqlite3',sqlite3.OPEN_READWRITE,(err)=>{
    if(err) return console.log(err);
    console.log("connection successful");
});

//get USD pair and vwap
app.get('/api/fx/ohlc/ETHUSD', async (req, res, next) => {
    const sql = `SELECT pair,vwap FROM market_price where pair= "ETH/USD" and startTime = (SELECT MAX(startTime) from market_price) `;
     await db.get(sql, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
         res.status(200).json(row);
    });
});

//get GBP pair and vwap
app.get('/api/fx/ohlc/ETHGBP', async (req, res, next) => {
    const sql = `SELECT pair,vwap FROM market_price where pair= "ETH/GBP" and endTime = (SELECT MAX(endTime) from market_price) `;
        db.get(sql,(err,row)=>{
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }  
            res.status(200).json(row);
        })
});

//history of USD based on high and low
app.get('/api/fx/ohlc/ETHUSD/history', async (req, res, next) => {
    const sql = `SELECT market_price.pair,strftime("%Y-%m-%d", endTime, 'unixepoch') AS endTime,max(high), min(low) FROM market_price where pair= "ETH/USD" GROUP BY strftime("%Y-%m-%d", endTime, 'unixepoch') `     
    await db.all(sql, (err, row) => {
        res.setHeader("Content-Type", "application/json");
         if (err) {
             res.status(400).json({ "error": err.message });
             console.log(res);
             return;
         }
         const x = []
         for(i=0;i< row.length;i++){
             values = Object.values(row[i])
             x.push(values)
         }        
         res.send(x);
     });
 });

 //history of GBP based on high and low
app.get('/api/fx/ohlc/ETHGBP/history', async (req, res, next) => {
    const sql = `SELECT pair,strftime("%Y-%m-%d", endTime, 'unixepoch') AS endTime,max(high), min(low) FROM market_price where pair= "ETH/GBP" GROUP BY strftime("%Y-%m-%d", endTime, 'unixepoch') `     
await db.all(sql, (err, row) => {
         if (err) {
             res.status(400).json({ "error": err.message });
             return;
         }
         const x = []
         for(i=0;i< row.length;i++){
             values = Object.values(row[i])
             x.push(values)
         }        
         res.send(x);
     });
 });
 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});