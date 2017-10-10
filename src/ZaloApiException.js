'use strict';

export default function ZaloApiException(res) {
	this.name = 'ZaloApiException';
	this.message = JSON.stringify(res || {});
	this.response = res;
	Error.captureStackTrace(this, this.constructor.name);
}

ZaloApiException.prototype = Object.create(Error.prototype, {
	constructor: {
		value: ZaloApiException,
		enumerable: false,
		writable: true,
		configurable: true
	}
});
