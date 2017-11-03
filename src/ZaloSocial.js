'use strict';

import request from 'request';
import { autobind } from 'core-decorators';
import ZaloApiException from './ZaloApiException';
var JSONbig = require('json-bigint')({"storeAsString": true});

var { version } = require('../package.json'),
	METHODS = ['GET', 'POST', 'DELETE', 'PUT'],
	debug = false,
	_logger = {
		debug: function(message) {
			if (debug) console.log(message);
		},
		info: function(message) {
			console.log(message);
		}
	},
	defaultOptions = Object.assign(Object.create(null), {
		Promise: Promise,
		accessToken: null,
		appId: null,
		appSecret: '',
		version: 'v2.0',
		timeout: null,
		redirectUri: null,
		proxy: null,
	}),
	verifyOptionField = function(key) {
		var keys = Object.keys(defaultOptions);
		return (keys.indexOf(key) != -1);
	},
	stringifyParams = function(params) {
		var data = [];
		if (!params || typeof params != 'object') return params;

		for (let key in params) {
			let value = params[key];
			if (value && typeof value !== 'string') {
				value = JSON.stringify(value);
			}
			if (value !== undefined) {
				data.push([key, encodeURIComponent(value)].join('='));
			}
		}

		return (data.length > 0) ? ('?' + data.join('&')) : '';
	},
	postParamData = function(params) {
		var data = {};

		for (let key in params) {
			let value = params[key];
			if (value && typeof value === 'object') {
				value = JSON.stringify(value);
			}
			if (value !== undefined) {
				data[key] = value;
			}
		}

		return data;
	},
	nodeifyCallback = function(callback) {
		return function(res) {
			if (!res || res.error) return callback(new ZaloApiException(res));
			callback(null, res);
		};
	};

const _opts = Symbol('opts');
const graph = Symbol('graph');
const oauthRequest = Symbol('oauthRequest');

class ZaloSocial {
	constructor(opts, _internalInherit) {
		_logger.debug('opts: ' + JSON.stringify(opts));
		_logger.debug('_internalInherit: ' + _internalInherit);

		if (_internalInherit instanceof ZaloSocial) {
			this[_opts] = Object.create(_internalInherit[_opts]);
		} else {
			this[_opts] = Object.create(defaultOptions);
		}

		if (typeof opts === 'object') {
			this.options(opts);
		}

	}

	@autobind
	api(...args) {
		let ret;

		//Check params has callback function
		if (args.length > 0 && typeof args[args.length - 1] !== 'function') {
			let Promise = this.options('Promise');
			ret = new Promise((resolve, reject) => {
				args.push((res) => {
					if (!res || res.error) {
						reject(new ZaloApiException(res));
					} else {
						resolve(res);
					}
				});
			});
		}

		this[graph](...args);

		return ret;
	}

	[graph](path, next, ...args) {
		var method,
			params,
			cb;

		if (typeof path !== 'string') {
			throw new Error(`Path is of type ${typeof path}, not string`);
		}

		while (next) {
			let type = typeof next;
			if (type === 'string' && !method) {
				method = next.toUpperCase();
			} else if (type === 'function' && !cb) {
				cb = next;
			} else if (type === 'object' && !params) {
				params = next;
			} else {
				_logger.info('Invalid argument passed to ZaloSocial.api(): ' + next);
				return;
			}
			next = args.shift();
		}

		method = method || 'GET';
		params = params || {};

		// remove prefix slash if one is given, as it's already in the base url
		if (path[0] === '/') {
			path = path.substr(1);
		}

		if (METHODS.indexOf(method) < 0) {
			_logger.info('Invalid method passed to ZaloSocial.api(): ' + method);
			return;
		}

		this[oauthRequest](path, method, params, cb);
	}

	[oauthRequest](path, method, params, cb) {
		var url, requestOptions, formOptions;
		cb = cb || function() {};
		url = `https://graph.zalo.me/${this.options('version')}/${path}`;

		if (!params.access_token) params.access_token = this.options('accessToken');
		if (method == 'POST') {
			formOptions = postParamData(params);
		} else {
			url += stringifyParams(params);
		}

		requestOptions = {
			method,
			url,
			form: formOptions,
			headers: {}
		};

		if (this.options('proxy')) {
			requestOptions['proxy'] = this.options('proxy');
		}
		if (this.options('timeout')) {
			requestOptions['timeout'] = this.options('timeout');
		}
		if (this.options('userAgent')) {
			requestOptions['headers'] = {
				'User-Agent': this.options('userAgent')
			};
		}
		requestOptions['headers']['SDK-Source'] = ['NodeSDK', version].join('-');

		_logger.debug('Request Options ' + JSON.stringify(requestOptions));

		request(requestOptions, (error, response, body) => {
			if (error !== null) return cb(error);

			let json;
			try {
				json = JSONbig.parse(body);
			} catch (ex) {
				json = {
					error: {
						code: 'JSONPARSE',
						Error: ex
					}
				};
			}
			cb(json);
		})
	}

	@autobind
	getAccessToken() {
		return this.options('accessToken');
	}

	@autobind
	getAccessTokenByOauthCode(oauthCode, cb) {
		let appId = this.options('appId');
		let appSecret = this.options('appSecret');

		if (!oauthCode) {
			throw new Error('Oauth code required');
		}
		
		if (!appId) {
			throw new Error('appId required');
		}

		if (!appSecret) {
			throw new Error('appSecret required');
		}

		if (cb == null || typeof cb !== 'function') {
			cb = function(res) {
				if (res != null && res.access_token) {
					this.options({accessToken: res.access_token});
				}
			}
		}

		let url = `https://oauth.zaloapp.com/v3/access_token?app_id=${appId}&app_secret=${this.options('appSecret')}&code=${oauthCode}`;
		let requestOptions = {
			url: url,
			method: 'GET',
			headers: {
				'SDK-Source': ['NodeSDK', version].join('-')
			}
		};
		request(requestOptions, (error, response, body) => {
			if (error !== null) return cb(error);

			let json;
			try {
				json = JSONbig.parse(body);
			} catch (ex) {
				json = {
					error: {
						code: 'JSONPARSE',
						Error: ex
					}
				};
			}
			cb(json);
		})
	}

	@autobind
	setAccessToken(accessToken) {
		this.options({ accessToken });
	}

	@autobind
	getLoginUrl(opt = {}) {
		let appId = opt.appId || this.options('appId');
		let redirectUri = opt.redirectUri || this.options('redirectUri');

		if (!appId) {
			throw new Error('appId required');
		}

		if (!redirectUri) {
			throw new Error('redirectUri required');
		}

		return `https://oauth.zaloapp.com/v3/auth?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
	}

	@autobind
	options(keyOrOptions) {
		let opt = this[_opts];
		if (!keyOrOptions) return opt;

		if (typeof keyOrOptions == 'string' && verifyOptionField(keyOrOptions)) {
			return opt[keyOrOptions];
		}

		if (keyOrOptions && typeof keyOrOptions == 'object') {
			let keys = Object.keys(keyOrOptions);
			for (let k in opt) {
				if (verifyOptionField(k) && keys.indexOf(k) != -1) {
					opt[k] = keyOrOptions[k];
				}
			}
		}
	}

}

export var ZS = new ZaloSocial();
export default ZS;
export { ZaloSocial, ZaloApiException, version };