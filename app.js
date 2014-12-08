/* 
File name: app.js
Server: Node JS
*/
var bodyParser = require('body-parser');
var userIp = "x.x.x.x";

var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var request = require('request');
var nconf = require('nconf');
var endpoint = "192.168.2.68:9001";
var endPointURL = "/wcs/resources/store/10151/";
var hybrisURL = "192.168.2.68";
var cat = "/wcsstore/Aurora/";
var cookieSession = require('cookie-session');
var WCTrustedTocken = "";
var WCToken = "";
nconf.argv()
       .env()
       .file({ file: './static/config.json' });

function include(f) {
  eval.apply(global, [fs.readFileSync(f).toString()]);
}
var log4js = require('log4js'); 
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');

var logger = log4js.getLogger('adapCom');

/* Include various web commerce endpoints which supports REST services */

include('ibm-endpoint/ibm-endpoint.js');
include('ibm-endpoint/ibm-response.js');
include('hybris-endpoint/hybris-endpoint.js');
include('hybris-endpoint/hybris-response.js');

/* MongoDB Connection */

var databaseUrl = "ikartdbuser:ikartdbuser@localhost/ikart"; 
var collections = ["users", "productmapping"]
var db = require("mongojs").connect(databaseUrl, collections);

/* HTTP Server (Port: 3000) */

var app = express();
var server = http.createServer(app);


app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use("/css", express.static(__dirname + '/static/css'));
app.use("/js", express.static(__dirname + '/static/js'));
app.use("/images", express.static(__dirname + '/static/images'));
app.use("/logs", express.static(__dirname + '/logs'));
/* HTTPS SSL Support (Port:443) */

var secureOptions = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem')
};
var httpsServer = https.createServer(secureOptions, app);

/* Special character escaping for json */

function jsonEscape(str)  {
    return str.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
}

/* Adapter factory declarations */

var adapterFactory = {
    doIBMWebCommerce: function()
    {
        return IBMWebCommerce;
    },
    doHybris: function()
    {
        return HybrisECommerce;
    }
};
/* Creation of adapterObject */
var adapterObject = adapterFactory.doHybris();
app.get('/', function(req, res)
{
    //res.json(quotes);
    console.log(adapterObject);
    res.type('text/plain'); // set content-type
    res.send(adapterObject.test());
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
{
    extended: true
}));
app.post('/login', function(req, res){
    var x={
        'userName':'ikart',
        'password':'ikart123'
    };
  getUserDetails(req.body.username,function(param){
   if(param!=null){
    console.log("deleting");
   deleteUser(req.body.username);
   }
   
    console.log(req.body);
    adapterObject.login(req.body, request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in login");
        }
        else
        {
            res.json(params);
            res.end();
        }
    });

});
});

app.get('/guestlogin', function(req, res)
{
    console.log("guest" + req.body);
    adapterObject.guestlogin(req.body, request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in login");
        }
        else
        {
            res.json(params);
            res.end();
        }
    });
});
app.get('/ticker', function(req, res)
{
    console.log(req.body);
    adapterObject.espotData(request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in ticker");
        }
        res.json(params);
        res.end();
    });
});
app.get('/imgurl', function(req, res)
{
    res.type('text/plain'); // set content-type
    res.send(endpoint);
});
app.get('/ikart', function(req, res)
{   console.log("inside ikart");
    res.type('text/plain'); // set content-type
    var x={
        'quantity':'1',
        'userId':'ikart',
        'amount':'100'
    };
    var y=JSON.stringify(x);
    res.send("1:ikart123:100");
});
app.get('/catalogurl', function(req, res)
{
    res.type('text/plain'); // set content-type
    res.send(cat);
});
app.get('/searchTerm', function(req, res)
{
    console.log(req.body);
    adapterObject.searchTerm(request, querystring, function(params)
    {
        /*if(JSON.parse(params).errors){
         console.log("error in search term");
         }*/
        res.json(params);
        res.end();
    });
});
app.get('/address', function(req, res)
{
    console.log(req.body);
    adapterObject.address(request, querystring, function(params)
    {
        /*if(JSON.parse(params).errors){
         console.log("error in search term");
         }*/
        res.json(params);
        res.end();
    });
});
app.post('/getItems', function(req, res)
{
    console.log(req.body);
    adapterObject.getItems(req.body, request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in get items");
        }
        res.json(params);
        res.end();
    });
});
app.post('/getProductDetails', function(req, res)
{
    console.log(req.body);
    adapterObject.getProductDetails(req.body, request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in product details");
        }
        res.json(params);
        res.end();
    });
});
app.post('/getCart', function(req, res)
{
    var ret_data;
    console.log("in get cart");
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {
        var body = {
            'WCToken': details.WCToken,
            'WCTrustedToken': details.WCTrustedToken
        };
        adapterObject.getCart(body, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in getting cart");
            }
            try
            {   console.log(params);
                res.json(params);
                res.end();
            }
            catch (e)
            {
                console.log(e);
            }
        });
        if (req.body.userId == "guest")
        {
            update("guest");
        }
    });
});
app.post('/addToCart', function(req, res)
{
    console.log("inside add to cart");
    getUserDetails(req.body.userId, function(details)
    {
        console.log(req.body);
        var body = {
            'WCToken': details.WCToken,
            'WCTrustedToken': details.WCTrustedToken,
            'productID': req.body.productID,
            'quantity': req.body.quantity
        };
        adapterObject.addToCart(body, request, querystring, function(params)
        {
            try
            {
                if (JSON.parse(params).errors)
                {
                    console.log("error in adding to cart");
                }
                res.setHeader('content-type', 'text/javascript');
                res.json(params);
                res.end();
            }
            catch (e)
            {
                console.log(e);
            }
        });
    });
});
app.get('/addToCart', function(req, res)
{
    db.users.find(
    {
        cartId: req.query.kartid,
        flag: "1"
    }, function(err, users)
    {
        if (err || !users) console.log("No users found");
        else users.forEach(function(user)
        {
            console.log("key: " + user.key1);
            db.productmapping.find(
            {
                rfid: req.query.pid
            }, function(err, users)
            {
                if (err || !users) console.log("No products found");
                else users.forEach(function(pdt)
                {
                    var body = {
                        'WCToken': user.key2,
                        'WCTrustedToken': user.key1,
                        'productID': pdt.pid,
                        'quantity': '1'
                    };
                    adapterObject.addToCart(body, request, querystring, function(params)
                    {
                        //   res.send(params);
                    });
                });
            });
        });
    });
    res.end();
});
app.post('/preCheckOut', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {
        var body = {
            'WCToken': details.WCToken,
            'WCTrustedToken': details.WCTrustedToken,
            'orderID': req.body.orderID
        };
        adapterObject.preCheckOut(body, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in preCheckOut");
            }
            res.json(params);
            res.end();
        });
    });
});
app.post('/checkout', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {
        var body = {
            'orderID': req.body.orderID,
            'WCToken': details.WCToken,
            'WCTrustedToken': details.WCTrustedToken
        };
        adapterObject.checkOut(body, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in checkout");
            }
            res.json(params);
            res.end();
        });
    });
    update(req.body.userId);
});
app.get('/checkout', function(req, res)
{
    console.log("in check out ....");
    var token;
    var session;
    getUserDetails(req.query.userId, function(details)
    {  token=details.WCToken;
        var body = {
            'PaymentId': "8796289663018",
            'WCToken': details.WCToken,
            'WCTrustedToken': details.WCTrustedToken
        };
        adapterObject.setPaymentInfo(body, request, querystring, function(params)
        {
            console.log("finished setting");
            if (JSON.parse(params).errors)
            {
                console.log("error in payment");
            }
            var x = JSON.parse(params);
            session = x.WCTrustedToken;
            console.log("the session id" + session);
            console.log("the session id" + params);
            
      adapterObject.personDetails(body,request,querystring,function(params)
      {
      var add=JSON.parse(params);
      var body1 = {
                'WCToken': token,
                'WCTrustedToken': session,
                'addressId': add.addressId,
            };
            adapterObject.setShippingAddress(body1, request, querystring, function(params)
            {
                if (JSON.parse(params).errors)
                {
                    console.log("error in checkout");
                }
                adapterObject.deliveryMethod(body1, request, querystring, function(params)
                {
                    if (JSON.parse(params).errors)
                    {
                        console.log("error in delivering");
                    }
                    adapterObject.preCheckOut(body1, request, querystring, function(params)
                    {
                        if (JSON.parse(params).errors)
                        {
                            console.log("error in preCheckOut");
                        }
                        adapterObject.checkOut(body1, request, querystring, function(params)
                        {
                            if (JSON.parse(params).errors)
                            {
                                console.log("error in checkout");
                            }
                            update(req.query.userId);
                            res.json(params);
                            res.end();
                        });
                    });
                });
            });
        });
   });
    });
});
app.post('/personDetails', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {
        adapterObject.personDetails(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in person details");
            }
            res.json(params);
            res.end();
        });
    });
});
app.get('/getPersonDetails', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.query.userId, function(details)
    {
        adapterObject.getPersonDetails(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in person details");
            }
            res.json(params);
            res.end();
        });
    });
});
app.get('/getpromocodes', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.query.userId, function(details)
    {
        adapterObject.getPromoCodes(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in promotion details");
            }
            res.json(params);
            res.end();
        });
    });
});
app.post('/setPromoCodes', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {   var body={
        'WCToken':details.WCToken,
        'WCTrustedToken':details.WCTrustedToken,
        'promoId':req.body.promoId
    }
        adapterObject.applyPromoCode(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in setPromoCodes details");
            }
            res.json(params);
            res.end();
        });
    });
});
app.get('/getCouponCodes', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.query.userId, function(details)
    {
        adapterObject.getCouponCodes(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in getCouponCodes details");
            }
            res.json(params);
            res.end();
        });
    });
});
app.post('/setCouponCodes', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {   var body={
        'WCToken':details.WCToken,
        'WCTrustedToken':details.WCTrustedToken,
        'couponId':req.body.couponId
    }
        adapterObject.applyCouponCode(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in setCouponCodes details");
            }
            res.json(params);
            res.end();
        });
    });
});
app.post('/setShippingAddress', function(req, res)
{
    console.log("shipping address" + req.body);
    getUserDetails(req.body.userId, function(details)
    {
        var body = {
            'WCToken': details.WCToken,
            'WCTrustedToken': details.WCTrustedToken,
            'x_calculationUsage': req.body.x_calculationUsage,
            'shipModeId': req.body.shipModeId,
            'addressId': req.body.addressId
        };
        adapterObject.setShippingAddress(body, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in set shipping address");
            }
            res.json(params);
            res.end();
        });
    });
});
app.post('/setPaymentInfo', function(req, res)
{
    console.log("payment info" + req.body);
    getUserDetails(req.body.userId, function(details)
    {
        var body = {
            'PaymentId': req.body.PaymentId,
            'WCToken': details.WCToken,
            'WCTrustedToken': details.WCTrustedToken
        };
        adapterObject.setPaymentInfo(body, request, querystring, function(params)
        {
            var param = JSON.parse(params);
            if (param.errors)
            {
                console.log("error in set payment info");
            }
            if (param.hasOwnProperty('WCTrustedToken')) updateSession(param.WCTrustedToken, req.body.userId);
            res.json(params);
            res.end();
        });
    });
});
app.post('/checkoutProfile', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {
        adapterObject.checkOutProfile(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in check out profile");
            }
            res.json(params);
            res.end();
        });
    });
});
app.post('/deliveryMethod', function(req, res)
{
    console.log(req.body);
    getUserDetails(req.body.userId, function(details)
    {
        adapterObject.deliveryMethod(details, request, querystring, function(params)
        {
            if (JSON.parse(params).errors)
            {
                console.log("error in delivering");
            }
            res.json(params);
            res.end();
        });
    });
});
app.get('/getSubCategories', function(req, res)
{
    console.log("insub cat" + req.body);
    adapterObject.getSubCategories(request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in delivering");
        }
        res.json(params);
        res.end();
    });
});
app.post('/getPromotions', function(req, res)
{   console.log("getting promotions");
     var body={
        userName:'wcadmin',
        password:'passw0rd'
     };
    adapterObject.login(body,request,querystring,function(params){
        var response=JSON.parse(params);

    adapterObject.getPromotions(request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in getting promotions");
        }
        res.json(params);
        res.end();
    });
});
});
app.post('/getCategoryDetails', function(req, res)
{
    console.log("in get cat:" + req.body);
    adapterObject.getCategoryDetails(req.body, request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in delivering");
        }
        res.json(params);
        res.end();
    });
});
app.post('/getProductDetailsByCategory', function(req, res)
{
    console.log(req.body);
    adapterObject.getProductDetailsByCategory(req.body, request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in delivering");
        }
        res.json(params);
        res.end();
    });
});
app.post('/espots', function(req, res)
{
    console.log("in the correct espots");
    console.log(req.body);
    var x;
    try
    {
        x = JSON.parse(req.body);
        console.log(x);
    }
    catch (e)
    {
        x = req.body;
    }
    adapterObject.espots(x, request, querystring, function(params)
    {
        if (JSON.parse(params).errors)
        {
            console.log("error in delivering");
        }
        res.json(params);
        res.end();
    });
});

/* Mapping for default request */

app.get('/admin', function(req, res) {
  logger.debug('admin method initiated '+'['+userIp+']');
    res.render('index',
  		{ title : 'Home' }
    );
});

app.get('/addProductWithRFID', function(req, res) {
  logger.debug('Add product RFID method initiated '+'['+userIp+']');
  var doc={pid:req.query.pid,rfid:req.query.rfid};

   db.productmapping.save(doc,function(err,result){
    if(err){
    console.log("error in adding to db");
    }
    });
    res.send("Success");
    res.end();
});

/* Mapping for default request */



server.listen(nconf.get('httpPort'));
httpsServer.listen(8080);
logger.debug('Server Initiated ');
logger.debug('HTTP Server Initiated on port: 8080'+'['+userIp+']');

function sendResponse(json,handler,object){
    var arr = object[handler]().split(",");
    var arr_length = arr.length;
    var returnJson = {};
    for (var i = 0; i < arr_length; i++) {
       var new_arr = arr[i].split('|');
       returnJson[new_arr[0]] = json[new_arr[1]];
    }
    return JSON.stringify(returnJson);
}

function add(userId,key1,key2,cartId){
    var doc={userId:userId,key1:key1,key2:key2,cartId:cartId,flag:"1"};
    db.users.save(doc,function(err,result){
    if(err){
    console.log("error in adding to db");
    }
    });
}

function update(uId){
  console.log("Userid for update:" + uId);
   db.users.update(
    { userId:uId },{ $set: { flag: "0" } }
    );

}

function deleteUser(){
    db.users.remove({'flag':'0'},function(err,result){if(err){
    console.log("error in deleting from db");
    }});
}