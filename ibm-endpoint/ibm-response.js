//IBM WEB COMMERCE RESPONSE FORMAT

var loginResponseVariables = "userid|userId,name|personalizationID";
var productDetailsResponseVariable = "name|name,price|price,thumbnail|thumbnail,id|id";
var addToCartResponseVariable = "orderid|orderId";
var viewCartResponseVariable = "buyername|buyername,total|total,orderid|orderid,orderitems|orderitems,status|status";
var checkOutVariable = "status|orderId";


var IBMResponseFormat = {
	loginResponse : function() {
		return loginResponseVariables;
	},
	productDetailsResponse: function() {
		return productDetailsResponseVariable;
	},
	addToCartResponse: function() {
		return addToCartResponseVariable;
	},
	viewCartResponse: function() {
		return viewCartResponseVariable;
	},
	checkOut: function() {
		return checkOutVariable;
	}
};
