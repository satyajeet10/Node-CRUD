const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'root',
  database : 'local_crud'
});

connection.connect((err)=>{
    if (err){
        return console.log('error connecting to database',err);
    }
    console.log('Connected as id '+connection.threadId);
});

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/dist'));

hbs.registerHelper("counter", function (index){
    return index + 1;
});

app.get("/",(req,res)=>{

    let sql = "select * from products";
    let query = connection.query(sql, (err,results)=>{
        if (err) throw err;
        res.render("index.hbs",{
            results: results
        });
    })
})

app.post("/fetch",(req,res)=>{
    let data = {productName: req.body.productName, productType: req.body.productType};
    if (req.body.action==="get_product"){
        let sql = "select * from `products` where `productId`="+req.body.id;
        let query = connection.query(sql, (err,results,fields)=>{
            if (err) throw err;
            res.send(results);
        })
    } else {
        connection.query('UPDATE products SET productName = ?, productType = ? WHERE productId = ?', [data.productName, data.productType, req.body.id], function (error, results, fields) {
            if(error) throw error;
            res.send(results);
        });
    }
})

app.post("/save",(req,res)=>{
    let data = {productName: req.body.productName, productType: req.body.productType};
    // var username=req.body;
    if (req.body.id===undefined){
        connection.query("INSERT INTO `products` SET ?", data, function(err, result,fields){
            if(err) throw err;
            res.send(result);
        });
    }
});

app.post("/delete",(req,res)=>{
        if (req.body.id){
            connection.query('DELETE FROM products WHERE productId='+req.body.id, function (error, results, fields) {
            if (error) throw error;
            res.send(results);
        })
    }
});


app.listen(3000,'0.0.0.0',()=>{
    console.log('Connected to localhost on port 3000');
});
