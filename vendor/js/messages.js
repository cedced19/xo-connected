(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return (root.messages = factory());
		});
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.messages = factory();
	}
}(this, function () {
	return {
		 displayError : function (error) {
		  if (error != '[object HTMLParagraphElement]') {
		   $("#error").text(error);
		  }
		 },
		 noneError : function  () {
		   $("#error").text('');
		 },
		 displayInfo : function (info) {
		  if (info != '[object HTMLParagraphElement]') {
		   $("#info").text(info);
		  }
		 },
		 noneInfo : function () {
		   $("#info").text('');
		 }
	}
}));
