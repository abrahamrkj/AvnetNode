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