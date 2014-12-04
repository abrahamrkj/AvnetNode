
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require("url");
var querystring = require('querystring');
var request = require('request');
var routes = require('./routes/index');
var users = require('./routes/users');
var endpoint = "commercedemo02.avnet.com";
var endPointURL = "/wcs/resources/store/10151/";
var hybrisURL = "192.168.2.68";
var http = require('http');
var https = require('https');
var app = express();
var server = http.createServer(app);
var tok;
var cat = "/wcsstore/Aurora/";
var databaseUrl = "ikartdbuser:ikartdbuser@localhost/ikart";
var collections = ["users", "productmapping"]
var db = require("mongojs").connect(databaseUrl, collections);
var querystring = require('querystring');
//console.log(window);
var IBMWebCommerce = {
    test: function()
    {   console.log("hello!!.i was called");
        return "hello from ibm"
    },
    login: function(postcontent, request, querystring, callback)
    {
        var uname = postcontent.userName;
        var upass = postcontent.password;
        var form = {
            "logonId": uname,
            "logonPassword": upass
        };
        var formData = JSON.stringify(form);
        var contentLength = formData.length;
        console.log(formData);
        request(
        {
            strictSSL: false,
            headers:
            {
                'Content-Length': contentLength,
                'Content-Type': "application/json"
            },
            uri: "https://"+endpoint+endPointURL + 'loginidentity',
            body: formData,
            method: 'POST'
        }, function(err, res, body)
        {
            if (postcontent.hasOwnProperty('kartId'))
            {   var tokens=JSON.parse(body);
                console.log(tokens);
                add(postcontent.userName, tokens.WCToken, tokens.WCTrustedToken, postcontent.kartId);
            }
            else
            {   var tokens=JSON.parse(body);
                console.log(tokens);
                add(postcontent.userName,tokens.WCToken,tokens.WCTrustedToken, "NAN");
            }
            callback(body);
        });
    },
    guestlogin: function(postcontent, request, querystring, callback)
    {
        console.log("in guestlogin");
        request(
        {
            strictSSL: false,
            uri: "https://"+endpoint+endPointURL + 'guestidentity',
            method: 'POST'
        }, function(err, res, body)
        {
            console.log("guest login body" + body)
            add("guest", body.WCTrustedToken, body.WCToken, "NAN");
            callback(body);
        });
    },
    espotData: function(request, querystring, callback)
    {
        request(
        {
            strictSSL: false,
            uri: "http://"+endpoint+endPointURL + 'espot/Ticker_Espot',
            method: 'GET'
        }, function(err, res, body)
        {
            callback(body);
        });
    },
    espots: function(body, request, querystring, callback)
    {
        var espotName = body.espotName;
        var query = "http://"+endpoint+endPointURL + 'espot/' + espotName;
        console.log(query);
        request(
        {
            strictSSL: false,
            uri: query,
            method: 'GET'
        }, function(err, res, body)
        {
            callback(body);
        });
    },
    searchTerm: function(request, querystring, callback)
    {
        request(
        {
            strictSSL: false,
            uri: "http://"+endpoint+endPointURL + 'espot/SearchTerm_Espot',
            method: 'GET'
        }, function(err, res, body)
        {
            callback(body);
        });
    },
    getItems: function(body, request, queryString, callback)
    {
        request(
        {
            strictSSL: false,
            uri: "http://"+endpoint+endPointURL + "productview/bySearchTerm/" + body.SearchTerm + "?responseFormat=JSON",
            method: 'GET'
        }, function(err, res, body)
        {
            callback(body);
        });
    },
    getProductDetails: function(body, request, queryString, callback)
    {
        console.log("prodid:" + body.productId);
        request(
        {
            strictSSL: false,
            uri: "http://"+endpoint+endPointURL + "productview/byId/" + body.productId + "?responseFormat=JSON",
            method: 'GET'
        }, function(err, res, body)
        {
            callback(body);
        });
    },
    getCart: function(body, request, queryString, callback)
    {
        var token = body.WCToken;
		var trustedToken=body.WCTrustedToken;
        var options = {
            host: endpoint,
            path: endPointURL+'/cart/@self',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken': token,
				'WCTrustedToken':trustedToken
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var cart = '';
            res.on('data', function(chunk)
            {
                cart += chunk;
            });
            res.on('end', function()
            {
                console.log(cart);
                callback(cart);
            });
        });
        req.end();
    },
    addToCart: function(body, request, querystring, callback)
    {
        console.log("in the add to cart :D")
        var orderItem = [];
        var form = {};
        form.orderItem = orderItem;
        var productId = body.productID;
        var pId = parseInt(productId);
        pId = pId + 1;
        console.log(pId);
        var productIDString = pId.toString();
        var quantity = body.quantity;
		var trustedToken=body.WCTrustedToken;

        var orderItems = {
            "productId": productIDString,
            "quantity": quantity
        }
        form.orderItem.push(orderItems);
        var data = JSON.stringify(form);
        console.log(data);
        var token = body.WCToken;
        console.log(token);
        var options = {
            host: endpoint,
            path: endPointURL+'cart',
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken': token,
				'WCTrustedToken':trustedToken
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            res.on('data', function(chunk)
            {
                console.log("body: " + chunk);
                callback(chunk);
            });
        });
        req.write(data);
        req.end();
    },
    preCheckOut: function(body, request, querystring, callback)
    {
        var od = body.orderID;
        var form = {
            "orderId": od
        };
        var token = body.WCToken;
		var trustedToken=body.WCTrustedToken;

        var formData = JSON.stringify(form);
        request(
        {
            strictSSL: false,
            headers:
            {
                'Content-Type': "application/json",
                'WCToken': token,
				'WCTrustedToken':trustedToken
            },
            uri: "https://"+endpoint+endPointURL + 'cart/@self/precheckout',
            data: formData,
            method: 'PUT'
        }, function(err, res, body)
        {
            callback(body);
        });
    },
    checkOut: function(body, request, querystring, callback)
    {
        var oid = body.orderID;
        var form = {
            "orderId": oid
        };
        var formData = JSON.stringify(form);
        var token = body.WCToken;
		var trustedToken=body.WCTrustedToken;

        request(
        {
            strictSSL: false,
            headers:
            {
                'Content-Type': "application/json",
                'WCToken': token,
				'WCTrustedToken':trustedToken
            },
            uri: "https://"+endpoint+endPointURL + 'cart/@self/checkout',
            data: formData,
            method: 'POST'
        }, function(err, res, body)
        {
            callback(body);
        });
    },
    personDetails: function(body, request, querystring, callback)
    {
        var token = body.WCToken;
        /* request({
                 headers: {
                   'Content-Type': "application/json",
                   'WCToken': token
                 },
                 uri: endPointURL+'person/@self/contact',
                 method: 'GET'
         }, function(err, res, body) {
             callback(body);
                  
         });*/
		var trustedToken=body.WCTrustedToken;

        var options = {
            host: endpoint,
            path: endPointURL+'/person/@self/contact',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken': token,
				'WCTrustedToken':trustedToken
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var x = '';
            res.on('data', function(chunk)
            {
                //console.log("body: " + chunk);
                x += chunk;
            });
            res.on('end', function()
            {
                //var ret=JSON.stringify(x);
                console.log(x);
                callback(x);
            });
        });
        req.end();
    },
    getPersonDetails: function(body, request, querystring, callback)
    {
        var token = body.WCToken;
        /* request({
                 headers: {
                   'Content-Type': "application/json",
                   'WCToken': token
                 },
                 uri: endPointURL+'person/@self/contact',
                 method: 'GET'
         }, function(err, res, body) {
             callback(body);
                  
         });*/
		var trustedToken=body.WCTrustedToken;

        var options = {
            host: endpoint,
            path: endPointURL+'person/@self/',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken': token,
				'WCTrustedToken':trustedToken
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var x = '';
            res.on('data', function(chunk)
            {
                //console.log("body: " + chunk);
                x += chunk;
            });
            res.on('end', function()
            {
                //var ret=JSON.stringify(x);
                console.log(x);
                callback(x);
            });
        });
        req.end();
    },
    checkOutProfile: function(body, request, querystring, callback)
    {
        console.log("in the checkout profile thing");
        var token = body.WCToken;
		var trustedToken=body.WCTrustedToken;

        var options = {
            host: endpoint,
            path: endPointURL+'person/@self/checkoutProfile',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken': token,
				'WCTrustedToken':trustedToken
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var x = '';
            res.on('data', function(chunk)
            {
                x += chunk;
            });
            res.on('end', function()
            {
                //var ret=JSON.stringify(x);
                console.log(x);
                callback(x);
            });
        });
        req.end();
    },
    setShippingAddress: function(body, request, querystring, callback)
    {
        console.log("in set shipping address");
        var token = body.WCToken;
        var x = body.x_calculationUsage;
        var s = body.shipModeId;
        var y = body.addressId;
        var form = {
            "x_calculationUsage": x,
            "shipModeId": s,
            "addressId": y
        };
        var formData = JSON.stringify(form);
		var trustedToken=body.WCTrustedToken;

        console.log(formData);
        var options = {
            host: endpoint,
            path: endPointURL+'cart/@self/shipping_info',
            method: 'PUT',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken': token,
				'WCTrustedToken':trustedToken
				
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var x = '';
            res.on('data', function(chunk)
            {
                console.log("body: of shipping address" + chunk);
                x += chunk;
            });
            res.on('end', function()
            {
                callback(x);
            });
        });
        req.write(formData);
        req.end();
    },
    setPaymentInfo: function(body, request, queryString, callback)
    {
        var data = {
            'success': true
        };
        var dataToSend = json.stringify(data);
        callback(dataToSend);
    },
    deliveryMethod: function(body, request, queryString, callback)
    {
        var data = {
            'success': true
        };
        var dataToSend = json.stringify(data);
        callback(data);
    },
    getSubCategories: function(request, querystring, callback)
    {
        console.log("getting");
        var categoryId = '10003';
        var query = endPointURL+'categoryview/byParentCategory/' + categoryId;
        console.log(query);
        var options = {
            host: endpoint,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var category = '';
            res.on('data', function(chunk)
            {
                category += chunk;
            });
            res.on('end', function()
            {
                console.log(category);
                callback(category);
            });
        });
        req.end();
    },
    getCategoryDetails: function(body, request, querystring, callback)
    {
        console.log("get category details");
        var categoryId = body.categoryId;
        var query = endPointURL+'categoryview/byId/' + categoryId;
        var options = {
            host: endpoint,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var category = '';
            res.on('data', function(chunk)
            {
                category += chunk;
            });
            res.on('end', function()
            {
                console.log(category);
                callback(category);
            });
        });
        req.end();
    },
    getProductDetailsByCategory: function(body, request, querystring, callback)
    {
        var categoryId = body.categoryId;
        var query = endPointURL+'productview/byCategory/' + categoryId;
        var options = {
            host: endpoint,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var category = '';
            res.on('data', function(chunk)
            {
                category += chunk;
            });
            res.on('end', function()
            {
                console.log(category);
                callback(category);
            });
        });
        req.end();
    }, 
    getPromotions: function(body,request, querystring, callback)
    {   console.log("getting promotions...");
        var token=body.WCToken;
        var trustedToken=body.WCTrustedToken;
        var query = endPointURL+'promotion/1201'
        var options = {
            host: endpoint,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken':token,
                'WCTrustedToken':trustedToken

            }
        };
        
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var promotion = '';
            res.on('data', function(chunk)
            {
                promotion += chunk;
            });
            res.on('end', function()
            {
                console.log("promotion"+promotion);
                var x=JSON.stringify(promotion);
                callback(x);
            });
            res.on('error',function(){
                console.log("ERROR");
            });
        });
          req.end();
        
    }, 
    getPromoCodes:function (body,request,querystringc,callback) {
      
       var token=body.WCToken;
        var trustedToken=body.WCTrustedToken;
        var query = endPointURL+'cart/@self/assigned_promotion_code'
        var options = {
            host: endpoint,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken':token,
                'WCTrustedToken':trustedToken

            }
        };
        
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var promotion = '';
            res.on('data', function(chunk)
            {
                promotion += chunk;
            });
            res.on('end', function()
            {
                console.log("promotion"+promotion);
                var x=JSON.stringify(promotion);
                callback(x);
            });
            res.on('error',function(){
                console.log("ERROR");
            });
        });
          req.end();  // body...
      },
    applyPromoCode:function (body,request,querystringc,callback) {
      
       var token=body.WCToken;
        var trustedToken=body.WCTrustedToken;
        var req_data={
            'promoCode':body.promoCode
        };

        var query = endPointURL+'cart/@self/assigned_promotion_code'
        var options = {
            host: endpoint,
            path: query,
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken':token,
                'WCTrustedToken':trustedToken

            }
        };
        
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var promotion = '';
            res.on('data', function(chunk)
            {
                promotion += chunk;
            });
            res.on('end', function()
            {
                console.log("promotion"+promotion);
                var x=JSON.stringify(promotion);
                callback(x);
            });
            res.on('error',function(){
                console.log("ERROR");
            });
        });
             var data_to_send=JSON.stringify(req_data);
             req.write(data_to_send);
          req.end();  // body...
      },
       getCouponCodes:function (body,request,querystringc,callback) {
      
       var token=body.WCToken;
        var trustedToken=body.WCTrustedToken;
        var query = endPointURL+'cart/@self/assigned_coupon'
        var options = {
            host: endpoint,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken':token,
                'WCTrustedToken':trustedToken

            }
        };
        
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var promotion = '';
            res.on('data', function(chunk)
            {
                promotion += chunk;
            });
            res.on('end', function()
            {
                console.log("promotion"+promotion);
                var x=JSON.stringify(promotion);
                callback(x);
            });
            res.on('error',function(){
                console.log("ERROR");
            });
        });
          req.end();  // body...
      },
    applyCouponCode:function (body,request,querystringc,callback) {
      
       var token=body.WCToken;
        var trustedToken=body.WCTrustedToken;
        var req_data={
            'couponId':body.couponId
        };

        var query = endPointURL+'cart/@self/assigned_coupon'
        var options = {
            host: endpoint,
            path: query,
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json',
                'WCToken':token,
                'WCTrustedToken':trustedToken

            }
        };
        
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var promotion = '';
            res.on('data', function(chunk)
            {
                promotion += chunk;
            });
            res.on('end', function()
            {
                console.log("promotion"+promotion);
                var x=JSON.stringify(promotion);
                callback(x);
            });
            res.on('error',function(){
                console.log("ERROR");
            });
        });
             var data_to_send=JSON.stringify(req_data);
             req.write(data_to_send);
          req.end();  // body...
      },
}
var HybrisECommerce = {
    test: function()
    {
        return "hello from Hybris"
    },
    guestlogin: function(body, request, querystring, callback)
    {
        var queryURL = '/rest/oauth/token?client_id=mobile_android&client_secret=secret&grant_type=client_credentials';
        console.log(hybrisURL + queryURL);
        var options = {
            host: hybrisURL,
            port: 9001,
            path: queryURL,
            method: 'GET'
        };
        var req = http.request(options, function(res)
        {
            console.log("requesting..")
            res.setEncoding('utf8');
            var tok = '';
            res.on('data', function(val)
            {
                tok += val;
            });
            res.on('error', function()
            {
                console.log("error");
            });
            res.on('end', function()
            {
                var chunk = JSON.parse(tok);
                var x = res.headers['set-cookie'];
                var sessionid = x[0];
                var start_index = sessionid.indexOf('=');
                var end_index = sessionid.indexOf(';');
                var jsessionid = sessionid.substring(start_index, end_index);
                console.log(jsessionid);
                var ret = {
                    "WCToken": chunk.access_token,
                    "WCTrustedToken": jsessionid
                }
                var dataToSend = JSON.stringify(ret);
                console.log(dataToSend + "the tokens");
                add("guest", jsessionid, chunk.access_token, "NAN");
                callback(dataToSend);
            });
        });
        req.end();
    },
    login: function(body, request, querystring, callback)
    {
        var username = body.userName;
        var password = body.password;
        var queryURL = '/rest/oauth/token?client_id=mobile_android&client_secret=secret&grant_type=password&username=' + username + '&password=' + password;
        console.log(hybrisURL + queryURL);
        var options = {
            host: hybrisURL,
            port: 9001,
            path: queryURL,
            method: 'GET'
        }
        var req = http.request(options, function(res)
        {
            console.log("requesting..")
            res.setEncoding('utf8');
            var data = '';
            res.on('data', function(val)
            {
                data += val;
            });
            res.on('error', function()
            {
                console.log("error");
            });
            res.on('end', function()
            {
                var chunk = JSON.parse(data);
                var x = res.headers['set-cookie'];
                var sessionid = x[0];
                var start_index = sessionid.indexOf('=');
                var end_index = sessionid.indexOf(';');
                var jsessionid = sessionid.substring(start_index, end_index);
                console.log(jsessionid);
                // console.log("chunk"+chunk);
                var ret = {
                    "WCToken": chunk.access_token,
                    "WCTrustedToken": jsessionid
                }
                var dataToSend = JSON.stringify(ret);
                callback(dataToSend);
                if (body.hasOwnProperty('kartId'))
                {
                    add(body.userName, jsessionid, chunk.access_token, body.kartId);
                }
                else
                {
                    add(body.userName, jsessionid, chunk.access_token, "NAN");
                }
            });
        });
        req.end();
    },
    espots: function(body, request, querystring, callback)
    {
        var espot1 = "http://www.adrecom.net/web-presence-management-blog/picts/blog/promotion-management.jpg";
        var espot2 = "http://www.ksleds.com/image/promotion2.jpg";
        var espot3 = "http://www.kanx.org/site/page_474.JPG";
        var espot4 = "http://2.bp.blogspot.com/-xpvLmnd7br8/UcCaoFhS1rI/AAAAAAAAADA/Pictk4IBXMY/s400/6wntk1.jpg";
        var params;
        if (body.espotName == 'promotion-espot-1')
        {
            params = {
                "MarketingSpotData": [
                {
                    "baseMarketingSpotActivityData": [
                    {
                        "marketingContentDescription": [
                        {
                            "maketingText": espot1
                        }]
                    }]
                }]
            };
        }
        if (body.espotName == 'promotion-espot-2')
        {
            params = {
                "MarketingSpotData": [
                {
                    "baseMarketingSpotActivityData": [
                    {
                        "marketingContentDescription": [
                        {
                            "maketingText": espot2
                        }]
                    }]
                }]
            };
        }
        if (body.espotName == 'promotion-espot-3')
        {
            params = {
                "MarketingSpotData": [
                {
                    "baseMarketingSpotActivityData": [
                    {
                        "marketingContentDescription": [
                        {
                            "maketingText": espot3
                        }]
                    }]
                }]
            };
        }
        if (body.espotName == 'promotion-espot-4')
        {
            params = {
                "MarketingSpotData": [
                {
                    "baseMarketingSpotActivityData": [
                    {
                        "marketingContentDescription": [
                        {
                            "maketingText": espot4
                        }]
                    }]
                }]
            };
        }
        var param = JSON.stringify(params);
        callback(param);
    },
    espotData: function(request, querystring, callback)
    {
        var params = {
            "MarketingSpotData": [
            {
                "baseMarketingSpotActivityData": [
                {
                    "marketingContentDescription": [
                    {
                        "maketingText": "Exclusive offer on Laptops"
                    }]
                }]
            }]
        };
        var param = JSON.stringify(params);
        callback(param);
    },
    searchTerm: function(request, querystring, callback)
    {
        console.log("search term");
        var params = {
            "MarketingSpotData": [
            {
                "baseMarketingSpotActivityData": [
                {
                    "marketingContentDescription": [
                    {
                        "maketingText": "Laptops"
                    }]
                }]
            }]
        };
        var param = JSON.stringify(params);
        callback(param);
    },
    getItems: function(body, request, queryString, callback)
    {
        var term = body.SearchTerm;
        console.log(term);
        var queryURL = '/rest/v1/habigail/products?query=' + term;
        console.log(queryURL);
        var options = {
            host: hybrisURL,
            port: 9001,
            path: queryURL,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        }
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', function(val)
            {
                data += val;
            });
            res.on('end', function()
            {
                // work with your data var
                //var x=JSON.stringify(data);
                //console.log(x);
                var chunk = JSON.parse(data);
                //console.log(chunk);
                //console.log(chunk.products);
                var CatalogEntryView = [];
                var ret = {};
                ret.CatalogEntryView = CatalogEntryView;
                ret.flag = "1";
                for (var i = 0; i < chunk.products.length; i++)
                {
                    var item = chunk.products[i];
                    var items = {
                        "uniqueID": item.code,
                        "thumbnail": item.images[0].url,
                        "name": item.name,
                        "longDescription": item.description,
                        "fullImage": item.images[1].url,
                        "Price": [
                        {
                            "priceValue": item.price.formattedValue
                        }]
                    }
                    ret.CatalogEntryView.push(items);
                }
                var dataToSend = JSON.stringify(ret);
                callback(dataToSend);
            });
        });
        req.end();
    },
    getCart: function(body, request, queryString, callback)
    {
        var token;
        var jsessionid;
        token = body.WCToken;
        jsessionid = body.WCTrustedToken;
        var query = '/rest/v1/habigail/cart;jsessionid' + jsessionid;
        var options = {
            host: hybrisURL,
            port: 9001,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                //'Cookie' :sessionid,
                'access_token': token
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var value = '';
            res.on('data', function(chunk)
            {
                value += chunk;
            });
            res.on('end', function()
            {
                console.log(value);
                var data = JSON.parse(value);
                var params = {};
                params.flag = "1";
                params.orderId = "";
                params.grandTotal = data.totalPrice.formattedValue;
                params.grandTotalCurrency = data.totalPrice.currencyIso;
                var orderItem = [];
                params.orderItem = orderItem;
                if (data.hasOwnProperty('entries'))
                {
                    for (var i = 0; i < data.entries.length; i++)
                    {
                        try
                        {
                            var entry = {
                                'quantity': data.entries[i].quantity,
                                'thumbnail': data.entries[i].product.images[2].url,
                                'name': data.entries[i].product.name,
                                'orderItemPrice': data.entries[i].totalPrice.formattedValue,
                                'orderItemId': data.entries[i].id,
                                'productId': data.entries[i].product.baseOptions[0].selected.code
                            };
                            params.orderItem.push(entry);
                        } //unit price ,
                        catch (e)
                        {
                            var entry = {
                                'quantity': data.entries[i].quantity,
                                'thumbnail': data.entries[i].product.images[2].url,
                                'name': data.entries[i].product.name,
                                'orderItemPrice': data.entries[i].totalPrice.formattedValue,
                                'orderItemId': data.entries[i].id,
                                'productId': data.entries[i].product.code
                            };
                            params.orderItem.push(entry);
                        }
                    }
                }
                var dataToSend = JSON.stringify(params);
                callback(dataToSend);
            });
        });
        req.end();
    },
    addToCart: function(body, request, querystring, callback)
    {
        console.log("adding to cart");
        var productId = body.productID;
        console.log("productId:" + productId);
        var quantity = body.quantity;
        var token = body.WCToken;
        var jsessionid = body.WCTrustedToken;
        var query = '/rest/v1/habigail/cart/entry;jsessionid' + jsessionid + '?code=' + productId;
        console.log(query);
        var options = {
            host: hybrisURL,
            port: 9001,
            path: query,
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json',
                'Cookie': jsessionid,
                'access_token': token
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var add = '';
            res.on('data', function(chunk)
            {
                add += chunk;
            });
            res.on('end', function()
            {
                console.log("body: " + add);
                var ret = JSON.stringify(add);
                callback(ret);
            });
        });
        req.end();
    },
    address: function(request, querystring, callback)
    {
        console.log("im here");
        var options = {
            host: hybrisURL,
            port: 9002,
            path: '/rest/v1/habigail/customers/current/addresses',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'access_token': '584eb1b5-4d96-46b9-921f-f4307a45e61c',
                'Authorization': 'Bearer 584eb1b5-4d96-46b9-921f-f4307a45e61c'
            },
        };
        var req = https.request(options, function(res)
        {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);
            var data = '';
            res.on('data', function(d)
            {
                data += d;
            });
            res.on('end', function()
            {
                //console.log("body"+data);
            });
        });
        req.end();
        req.on('error', function(e)
        {
            console.error(e);
        });
    },
    personDetails: function(body, request, queryString, callback)
    {
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var options = {
            host: hybrisURL,
            port: 9002,
            path: '/rest/v1/habigail/customers/current/addresses',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'Authorization': authorization
            },
        };
        var req = https.request(options, function(res)
        {
            console.log("statusCode: ", res.statusCode);
            //console.log("headers: ", res.headers);
            var data_con = '';
            res.on('data', function(d)
            {
                data_con += d;
            });
            res.on('end', function()
            {
                var data = JSON.parse(data_con);
                //console.log("body"+data);
                var params = {};
                var contact = [];
                params.contact = contact;
                for (var i = 0; i < data.addresses.length; i++)
                {
                    var address = {
                        'addressId': data.addresses[i].id,
                        'addressLine': [
                            data.addresses[i].line1,
                            data.addresses[i].line2
                        ],
                        'city': data.addresses[i].town,
                        'country': data.addresses[i].country.name,
                        'lastName': data.addresses[i].lastName,
                        'state': data.addresses[i].region.name,
                        'zipCode': data.addresses[i].postalCode,
                    };
                    params.contact.push(address);
                }
                var dataToSend = JSON.stringify(params);
                callback(dataToSend);
            });
        });
        req.end();
        req.on('error', function(e)
        {
            console.error(e);
        });
    },
    getPersonDetails: function(body, request, queryString, callback)
    {
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var options = {
            host: hybrisURL,
            port: 9002,
            path: '/rest/v1/habigail/customers/current',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'Authorization': authorization
            },
        };
        var req = https.request(options, function(res)
        {
            console.log("statusCode: ", res.statusCode);
            //console.log("headers: ", res.headers);
            var data_con = '';
            res.on('data', function(d)
            {
                data_con += d;
            });
            res.on('end', function()
            {
                var data = JSON.parse(data_con);
                //console.log("body"+data);
                var params;
                params = {
                    'addressId': data.id,
                    'addressLine': [
                        data.line1,
                        data.line2
                    ],
                    'city': data.town,
                    'country': data.defaultAddress.country.name,
                    'firstName': data.defaultAddress.firstName,
                    'lastName': data.defaultAddress.lastName,
                    'state': data.defaultAddress.region.name,
                    'zipCode': data.defaultAddress.postalCode,
                    'mobilephone1': "919-111-1111",
                    "preferredCurrency": data.currency.isocode,
                    "preferredLanguage": data.language.isocode,
                    "email1": data.displayUid,
                    "logonId": data.uid
                };
                var dataToSend = JSON.stringify(params);
                callback(dataToSend);
            });
        });
        req.end();
        req.on('error', function(e)
        {
            console.error(e);
        });
    },
    checkOutProfile: function(body, request, queryString, callback)
    {
        console.log("in checkoutProfile");
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var options = {
            host: hybrisURL,
            port: 9002,
            path: '/rest/v1/habigail/customers/current/paymentinfos',
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
                'Authorization': authorization
            },
        };
        var req = https.request(options, function(res)
        {
            console.log("statusCode: ", res.statusCode);
            //console.log("headers: ", res.headers);
            var data_con = '';
            res.on('data', function(d)
            {
                data_con += d;
            });
            res.on('end', function()
            {
                var data = JSON.parse(data_con);
                // First name, Last name, email Id , phone, currency , country/state
                //  console.log("body :"+data_con);
                var params = {};
                var CheckoutProfile = [];
                params.CheckoutProfile = CheckoutProfile;
                for (var i = 0; i < data.paymentInfos.length; i++)
                {
                    var payInfo = {
                        'protocolData': [
                        {
                            'name': 'expire_month',
                            'value': data.paymentInfos[i].expiryMonth
                        },
                        {
                            'name': 'expire_year',
                            'value': data.paymentInfos[i].expiryYear
                        },
                        {
                            'name': 'cc_brand',
                            'value': data.paymentInfos[i].cardType.name
                        },
                        {
                            'name': 'account',
                            'value': data.paymentInfos[i].cardNumber
                        },
                        {
                            'name': 'payMethodId',
                            'value': data.paymentInfos[i].id
                        },
                        {
                            'name': 'payment_method',
                            'value': data.paymentInfos[i].cardType.code
                        }]
                    };
                    params.CheckoutProfile.push(payInfo);
                }
                var dataToSend = JSON.stringify(params);
                callback(dataToSend);
                // console.log(dataToSend);
            });
        });
        req.end();
        req.on('error', function(e)
        {
            console.error(e);
        });
    },
    setShippingAddress: function(body, request, querystring, callback)
    {
        console.log("setting shipping info");
        var addressId = body.addressId;
        console.log(addressId);
        var token = body.WCToken;
        var jsessionid = body.WCTrustedToken;
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var query = '/rest/v1/habigail/cart/address/delivery/' + addressId + ';jsessionid' + jsessionid;
        var options = {
            host: hybrisURL,
            port: 9002,
            path: query,
            method: 'PUT',
            headers:
            {
                'Content-Type': 'application/json',
                'Cookie': jsessionid,
                'Authorization': authorization
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var add = '';
            res.on('data', function(chunk)
            {
                add += chunk;
            });
            res.on('end', function()
            {
                // console.log("body: " + add);
                var ret = JSON.stringify(add);
                callback(ret);
                //  console.log(res.headers);
            });
        });
        req.end();
    },
    setPaymentInfo: function(body, request, querystring, callback)
    {
        console.log("setting payment info");
        var ip = JSON.stringify(body);
        console.log(ip);
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var payId = body.PaymentId;
        console.log("payment id" + payId);
        var jsessionid = body.WCTrustedToken;
        var query = '/rest/v1/habigail/cart/paymentinfo/' + payId + ';jsessionid' + jsessionid;
        var options = {
            host: hybrisURL,
            port: 9002,
            path: query,
            method: 'PUT',
            headers:
            {
                'Content-Type': 'application/json',
                'Cookie': jsessionid,
                'Authorization': authorization
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var add = '';
            res.on('data', function(chunk)
            {
                add += chunk;
            });
            res.on('end', function()
            {
                // console.log("body: " + add);
                var ret = JSON.stringify(add);
                //callback(ret);
                var x = res.headers['set-cookie'];
                var sesionid = x[0];
                var start_index = sesionid.indexOf('=');
                var end_index = sesionid.indexOf(';');
                var jsesionid = sesionid.substring(start_index, end_index);
                console.log(jsesionid);
                var param = {
                    'WCTrustedToken': jsesionid
                };
                var dataToSend = JSON.stringify(param);
                //console.log(dataToSend);
                callback(dataToSend);
                //console.log(res.headers);
            });
        });
        req.end();
    },
    preCheckOut: function(body, request, querystring, callback)
    {
        console.log("in pre checkout");
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var jsessionid = body.WCTrustedToken;
        var query = '/rest/v1/habigail/cart/authorize;jsessionid' + jsessionid + '?securityCode=123;';
        var options = {
            host: hybrisURL,
            port: 9002,
            path: query,
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json',
                'Cookie': jsessionid,
                'Authorization': authorization
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var add = '';
            res.on('data', function(chunk)
            {
                add += chunk;
            });
            res.on('end', function()
            {
                console.log("body: " + add);
                var ret = JSON.stringify(add);
                callback(ret);
            });
        });
        req.end();
    },
    checkOut: function(body, request, querystring, callback)
    {
        console.log("checkout");
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var jsessionid = body.WCTrustedToken;
        var query = '/rest/v1/habigail/cart/placeorder;jsessionid' + jsessionid;
        var options = {
            host: hybrisURL,
            port: 9002,
            path: query,
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json',
                'Cookie': jsessionid,
                'Authorization': authorization
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var add = '';
            res.on('data', function(chunk)
            {
                add += chunk;
            });
            res.on('end', function()
            {
                console.log("body: " + add);
                var ret = JSON.stringify(add);
                callback(ret); //order Id
            });
        });
        req.end();
    },
    deliveryMethod: function(body, request, querystring, callback)
    {
        console.log("setting delivey method info");
        var ip = JSON.stringify(body);
        console.log(ip);
        var accesToken = body.WCToken;
        var authorization = 'Bearer ' + accesToken;
        var jsessionid = body.WCTrustedToken;
        console.log(jsessionid);
        var query = '/cart/deliverymodes/standard-gross;jsessionid' + jsessionid;
        var options = {
            host: hybrisURL,
            port: 9002,
            path: query,
            method: 'PUT',
            headers:
            {
                'Content-Type': 'application/json',
                'Cookie': jsessionid,
                'Authorization': authorization
            }
        };
        var req = https.request(options, function(res)
        {
            res.setEncoding('utf8');
            var add = '';
            res.on('data', function(chunk)
            {
                add += chunk;
            });
            res.on('end', function()
            {
                // console.log("body: " + add);
                var ret = JSON.stringify(add);
                //callback(ret);
                callback(ret);
            });
        });
        req.end();
    },
    getSubCategories: function(request, querystring, callback)
    {
        var categoryId = 'women';
        var query = '/rest/v1/habigail/catalogs/habigailProductCatalog/Online/categories/' + categoryId + '?options=SUBCATEGORIES';
        var options = {
            host: hybrisURL,
            port: 9001,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var cat = '';
            res.on('data', function(chunk)
            {
                cat += chunk;
            });
            res.on('end', function()
            {
                var category = JSON.parse(cat);
                console.log(category);
                var param = {};
                var CatalogGroupView = [];
                param.CatalogGroupView = CatalogGroupView;
                for (var i = 0; i < category.subcategories.length; i++)
                {
                    var subcategory = {
                        'uniqueID': category.subcategories[i].id
                    }
                    param.CatalogGroupView.push(subcategory);
                }
                var dataToSend = JSON.stringify(param);
                callback(dataToSend);
            });
        });
        req.end();
    },
    getCategoryDetails: function(body, request, querystring, callback)
    {
        var categoryId = body.categoryId;
        var query = '/rest/v1/habigail/catalogs/habigailProductCatalog/Online/categories/' + categoryId;
        var options = {
            host: hybrisURL,
            port: 9001,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var cat = '';
            res.on('data', function(chunk)
            {
                cat += chunk;
            });
            res.on('end', function()
            {
                var category = JSON.parse(cat);
                console.log(category);
                var subcategory = {
                    'CatalogGroupView': [
                    {
                        'uniqueID': category.id,
                        'name': category.name,
                        'fullImage': ''
                    }]
                };
                var dataToSend = JSON.stringify(subcategory);
                callback(dataToSend);
            });
        });
        req.end();
    },
    getProductDetailsByCategory: function(body, request, querystring, callback)
    {
        var categoryId = body.categoryId;
        var query = '/rest/v1/habigail/catalogs/habigailProductCatalog/Online/categories/' + categoryId + '?options=PRODUCTS';
        var options = {
            host: hybrisURL,
            port: 9001,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var cat = '';
            res.on('data', function(chunk)
            {
                cat += chunk;
            });
            res.on('end', function()
            {
                var category = JSON.parse(cat);
                var param = {};
                var CatalogEntryView = [];
                param.CatalogEntryView = CatalogEntryView;
                for (var i = 0; i < category.products.length; i++)
                {
                    var catalog = {
                        'uniqueID': category.products[i].code
                    }
                    param.CatalogEntryView.push(catalog);
                }
                var dataToSend = JSON.stringify(param);
                callback(dataToSend);
            });
        });
        req.end();
    },
    getProductDetails: function(body, request, querystring, callback)
    {
        var categoryId = body.productId;
        var query = '/rest/v1/habigail/products/' + categoryId;
        var options = {
            host: hybrisURL,
            port: 9001,
            path: query,
            method: 'GET',
            headers:
            {
                'Content-Type': 'application/json',
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            var prod = '';
            res.on('data', function(chunk)
            {
                prod += chunk;
            });
            res.on('end', function()
            {
                var param = {};
                var product = JSON.parse(prod);
                var CatalogEntryView = [];
                param.CatalogEntryView = CatalogEntryView;
                if (product.baseOptions.length == 0)
                {
                    var catentry = {
                        'uniqueID': product.code,
                        'name': product.name,
                        'metaDescription': "", //Long Description
                        'Price': [
                        {
                            'priceValue': ""
                        }],
                        'fullImage': product.images[1].url,
                        'thumbnail': product.images[2].url,
                        'SKUs': [
                        {
                            'SKUUniqueID': product.code
                        }]
                    };
                    param.CatalogEntryView.push(catentry);
                }
                for (var i = 0; i < product.baseOptions.length; i++)
                {
                    var catentry = {
                        'uniqueID': product.baseOptions[i].selected.code,
                        'name': product.name,
                        'metaDescription': product.baseOptions[i].selected.summary,
                        'Price': [
                        {
                            'priceValue': product.baseOptions[i].selected.priceData.value
                        }],
                        'fullImage': product.images[1].url,
                        'thumbnail': product.images[2].url,
                        'SKUs': [
                        {
                            'SKUUniqueID': product.baseOptions[i].selected.code
                        }]
                    };
                    param.CatalogEntryView.push(catentry);
                }
                var dataToSend = JSON.stringify(param);
                console.log(dataToSend);
                callback(dataToSend);
            });
        });
        req.end();
    },
    getPromotions:function(body,request,queryString,callback){

    },
    getPromoCodes:function(body,request,querystring,callback){

    },
    applyPromoCode:function(body,request,querystring,callback){

    },
    getCouponCodes:function(b,r,q,c){

    },
    applyCouponCode:function(b,r,q,c){

    }
}
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
var adapterObject = adapterFactory.doIBMWebCommerce();
app.get('/', function(req, res)
{
    //res.json(quotes);
    console.log(req.headers);
    res.type('text/plain'); // set content-type
    res.send(adapterObject.test());
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
{
    extended: true
}));
app.get('/login', function(req, res){
    var x={
        'userName':'ikart',
        'password':'ikart123'
    };
  getUserDetails('ikart'/*req.body.username*/,function(param){
   if(param!=null){
    console.log("deleting");
   deleteUser('ikart');
   }
   
    console.log(req.body);
    adapterObject.login(x, request, querystring, function(params)
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
    {
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
			var add=JSON.parse(body);
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
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function(req, res, next)
{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development')
{
    app.use(function(err, req, res, next)
    {
        res.status(err.status || 500);
        res.render('error',
        {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next)
{
    res.status(err.status || 500);
    res.render('error',
    {
        message: err.message,
        error:
        {}
    });
});
server.listen(80);

function sendResponse(json, handler, object)
{
    var arr = object[handler]().split(",");
    var arr_length = arr.length;
    var returnJson = {};
    for (var i = 0; i < arr_length; i++)
    {
        var new_arr = arr[i].split('|');
        returnJson[new_arr[0]] = json[new_arr[1]];
    }
    return JSON.stringify(returnJson);
}

function add(userId, key1, key2, cartId)
{
    var doc = {
        userId: userId,
        key1: key1,
        key2: key2,
        cartId: cartId,
        flag: "1"
    };
    db.users.save(doc, function(err, result)
    {
        if (err)
        {
            console.log("error in adding to db");
        }
    });
}

function update(uId)
{
    console.log("Userid for update:" + uId);
    db.users.update(
    {
        userId: uId
    },
    {
        $set:
        {
            flag: "0"
        }
    });
}

function deleteUser()
{
    db.users.remove(
    {
        'flag': '0'
    }, function(err, result)
    {
        if (err)
        {
            console.log("error in deleting from db");
        }
    });
}
function deleteUser(userId)
{
    db.users.remove(
    {
        'userId': userId
    }, function(err, result)
    {
        if (err)
        {
            console.log("error in deleting from db");
        }
    });
}
function getUserDetails(userid, callback)
{
    console.log("getting user Details.."+userid);
    db.users.find(
    {
        userId: userid,
        flag: "1"
    }, function(err, users)
    {   var count=0;
        console.log("gotcha.."+users);
        if (err || !users) {
            console.log("No users found")
          //  callback(null);
        }
        else users.forEach(function(user)
        {   count=count+1;
            console.log("user Found"+user);
            var details = {
                'WCToken': user.key2,
                'WCTrustedToken': user.key1
            };
            callback(details);
        });
            if(count==0){
    callback(null);
    }
    });
    
}

function updateSession(wctrustedtoken, userid)
{
    db.users.update(
    {
        userId: userid
    },
    {
        $set:
        {
            key1: wctrustedtoken
        }
    });
}
module.exports = app;