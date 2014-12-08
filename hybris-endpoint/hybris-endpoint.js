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
                console.log(dataToSend);
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