'use strict';

import request from 'request';
import crypto from 'crypto';
import { autobind } from 'core-decorators';
import ZaloApiException from './ZaloApiException';
import fs from 'fs';
import stream from 'stream';

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
		oaid: null,
		secretkey: null,
		version: 'v1',
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
		var isFormData = false;
		for (let key in params) {
			let value = params[key];
			if (value && typeof value !== 'string') {
				if (Buffer.isBuffer(value)) {
					isFormData = true;
				} else if (typeof value.read === 'function' && typeof value.pipe === 'function' && value.readable) {
					isFormData = true;
				} else {
					value = JSON.stringify(value);
				}
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
	},
	loadFile = function(fileUrl, callback) {
		//Require download
		if (fileUrl.indexOf('http') != -1) {
			let s = fileUrl.split('.');
			let ex = '';
			if (s && s.length >= 2) ex = s[s.length - 1];
			let pathFile = __dirname + '/download_' + new Date().getTime() + '.' + ex;
			let fileData = fs.createWriteStream(pathFile);

			request.head(fileUrl, function(err, res, body) {
				request(fileUrl).pipe(fileData).on('close', function() {
					let data = fs.createReadStream(pathFile);
					fs.unlink(pathFile);
					return callback(null, data);
				});
			});
		} else {
			let data = fs.createReadStream(fileUrl);
			return callback(null, data);
		}
	};

const _opts = Symbol('opts');
const graph = Symbol('graph');
const oauthRequest = Symbol('oauthRequest');

class ZaloOA {
	constructor(opts, _internalInherit) {
		_logger.debug('opts: ' + JSON.stringify(opts));
		_logger.debug('_internalInherit: ' + _internalInherit);

		if (_internalInherit instanceof ZaloOA) {
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
				_logger.info('Invalid argument passed to ZaloOA.api(): ' + next);
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
			_logger.info('Invalid method passed to ZaloOA.api(): ' + method);
			return;
		}

		//Check has contain file upload
		if (params.file) {
			let fileUrl = params.file;
			if (method == 'GET') {
				_logger.info('Invalid method passed to ZaloOA.api()');
				return;
			}

			if (!fileUrl) {
				_logger.info('Invalid fileUrl passed to ZaloOA.api()');
				return;
			}
			loadFile(fileUrl, (err, data) => {
				if (err || !data) _logger.info('Cannot read file from url: ' + fileUrl);
				params.file = data;
				this[oauthRequest](path, method, params, cb);
			})

		} else this[oauthRequest](path, method, params, cb);
	}

	[oauthRequest](path, method, params, cb) {
		var url, requestOptions, formOptions, isMultipart = false;
		cb = cb || function() {};
		url = `https://openapi.zaloapp.com/oa/${this.options('version')}/${path}`;

		//You are not necessary pass these parameter
		var fieldsReadOnly = ['timestamp', 'mac', 'oaid', 'secretkey'];
		fieldsReadOnly.map((f) => {
			if (params && params[f]) {
				delete params[f];
			};
		});

		var timestamp = new Date().getTime();


		if (method == 'POST') {
			let data = {};
			let mcontent = '';

			//Data for API upload file
			if (params.file) {
				data = {
					timestamp: timestamp,
					oaid: this.options('oaid'),
					file: params.file
				}
				isMultipart = true;
				mcontent = data.oaid + data.timestamp + this.options('secretkey');
			} else {
				data = {
					timestamp: timestamp,
					oaid: this.options('oaid'),
					data: params
				}
				mcontent = data.oaid + JSON.stringify(data.data) + data.timestamp + this.options('secretkey');
			}
			data.mac = crypto.createHash('sha256').update(mcontent,'utf8').digest('hex');
			formOptions = postParamData(data);
		} else {
			let mcontent = '';
			var keys = Object.keys(params);

			keys.map((k) => {
				let v = params[k];
				if (typeof v == 'object') {
					mcontent += JSON.stringify(v);
				} else mcontent += v;
			});

			params.oaid = this.options('oaid');
			params.timestamp = timestamp;

			mcontent = params.oaid + mcontent + params.timestamp + this.options('secretkey');
			params.mac = crypto.createHash('sha256').update(mcontent,'utf8').digest('hex');
			url += stringifyParams(params);
		}

		requestOptions = {
			method,
			url,
			headers: {}
		};

		if (isMultipart) {
			requestOptions['headers']['content-type'] = 'multipart/form-data';
			requestOptions.formData = formOptions;
		} else requestOptions.form = formOptions;

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
				json = JSON.parse(body);
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

export var ZOA = new ZaloOA();
export default ZOA;
export { ZaloOA, ZaloApiException, version };