'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.version = exports.ZaloApiException = exports.ZaloOA = exports.ZOA = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _desc, _value, _class;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _coreDecorators = require('core-decorators');

var _ZaloApiException = require('./ZaloApiException');

var _ZaloApiException2 = _interopRequireDefault(_ZaloApiException);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

var JSONbig = require('json-bigint')({ "storeAsString": true });

var _require = require('../package.json'),
    version = _require.version,
    METHODS = ['GET', 'POST', 'DELETE', 'PUT'],
    _debug = false,
    _logger = {
	debug: function debug(message) {
		if (_debug) console.log(message);
	},
	info: function info(message) {
		console.log(message);
	}
},
    defaultOptions = (0, _assign2.default)((0, _create2.default)(null), {
	Promise: _promise2.default,
	oaid: null,
	secretkey: null,
	version: 'v1',
	timeout: null,
	redirectUri: null,
	proxy: null
}),
    verifyOptionField = function verifyOptionField(key) {
	var keys = (0, _keys2.default)(defaultOptions);
	return keys.indexOf(key) != -1;
},
    stringifyParams = function stringifyParams(params) {
	var data = [];
	if (!params || (typeof params === 'undefined' ? 'undefined' : (0, _typeof3.default)(params)) != 'object') return params;

	for (var key in params) {
		var value = params[key];
		if (value && typeof value !== 'string') {
			value = (0, _stringify2.default)(value);
		}
		if (value !== undefined) {
			data.push([key, encodeURIComponent(value)].join('='));
		}
	}

	return data.length > 0 ? '?' + data.join('&') : '';
},
    postParamData = function postParamData(params) {
	var data = {};
	var isFormData = false;
	for (var key in params) {
		var value = params[key];
		if (value && typeof value !== 'string') {
			if (Buffer.isBuffer(value)) {
				isFormData = true;
			} else if (typeof value.read === 'function' && typeof value.pipe === 'function' && value.readable) {
				isFormData = true;
			} else {
				value = (0, _stringify2.default)(value);
			}
		}
		if (value !== undefined) {
			data[key] = value;
		}
	}
	return data;
},
    nodeifyCallback = function nodeifyCallback(callback) {
	return function (res) {
		if (!res || res.error) return callback(new _ZaloApiException2.default(res));
		callback(null, res);
	};
},
    loadFile = function loadFile(fileUrl, callback) {
	//Require download
	if (fileUrl.indexOf('http') != -1) {
		var s = fileUrl.split('.');
		var ex = '';
		if (s && s.length >= 2) ex = s[s.length - 1];
		var pathFile = __dirname + '/download_' + new Date().getTime() + '.' + ex;
		var fileData = _fs2.default.createWriteStream(pathFile);

		_request2.default.head(fileUrl, function (err, res, body) {
			(0, _request2.default)(fileUrl).pipe(fileData).on('close', function () {
				var data = _fs2.default.createReadStream(pathFile);
				_fs2.default.unlink(pathFile);
				return callback(null, data);
			});
		});
	} else {
		var data = _fs2.default.createReadStream(fileUrl);
		return callback(null, data);
	}
};

var _opts = (0, _symbol2.default)('opts');
var graph = (0, _symbol2.default)('graph');
var oauthRequest = (0, _symbol2.default)('oauthRequest');

var ZaloOA = (_class = function () {
	function ZaloOA(opts, _internalInherit) {
		(0, _classCallCheck3.default)(this, ZaloOA);

		_logger.debug('opts: ' + (0, _stringify2.default)(opts));
		_logger.debug('_internalInherit: ' + _internalInherit);

		if (_internalInherit instanceof ZaloOA) {
			this[_opts] = (0, _create2.default)(_internalInherit[_opts]);
		} else {
			this[_opts] = (0, _create2.default)(defaultOptions);
		}

		if ((typeof opts === 'undefined' ? 'undefined' : (0, _typeof3.default)(opts)) === 'object') {
			this.options(opts);
		}
	}

	(0, _createClass3.default)(ZaloOA, [{
		key: 'api',
		value: function api() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var ret = void 0;

			//Check params has callback function
			if (args.length > 0 && typeof args[args.length - 1] !== 'function') {
				var _Promise2 = this.options('Promise');
				ret = new _Promise2(function (resolve, reject) {
					args.push(function (res) {
						if (!res || res.error) {
							reject(new _ZaloApiException2.default(res));
						} else {
							resolve(res);
						}
					});
				});
			}

			this[graph].apply(this, args);

			return ret;
		}
	}, {
		key: graph,
		value: function value(path, next) {
			var _this = this;

			var method, params, cb;

			if (typeof path !== 'string') {
				throw new Error('Path is of type ' + (typeof path === 'undefined' ? 'undefined' : (0, _typeof3.default)(path)) + ', not string');
			}

			for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
				args[_key2 - 2] = arguments[_key2];
			}

			while (next) {
				var type = typeof next === 'undefined' ? 'undefined' : (0, _typeof3.default)(next);
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
				var fileUrl = params.file;
				if (method == 'GET') {
					_logger.info('Invalid method passed to ZaloOA.api()');
					return;
				}

				if (!fileUrl) {
					_logger.info('Invalid fileUrl passed to ZaloOA.api()');
					return;
				}
				loadFile(fileUrl, function (err, data) {
					if (err || !data) _logger.info('Cannot read file from url: ' + fileUrl);
					params.file = data;
					_this[oauthRequest](path, method, params, cb);
				});
			} else this[oauthRequest](path, method, params, cb);
		}
	}, {
		key: oauthRequest,
		value: function value(path, method, params, cb) {
			var url,
			    requestOptions,
			    formOptions,
			    isMultipart = false;
			cb = cb || function () {};
			url = 'https://openapi.zaloapp.com/oa/' + this.options('version') + '/' + path;

			//You are not necessary pass these parameter
			var fieldsReadOnly = ['timestamp', 'mac', 'oaid', 'secretkey'];
			fieldsReadOnly.map(function (f) {
				if (params && params[f]) {
					delete params[f];
				};
			});

			var timestamp = new Date().getTime();

			if (method == 'POST') {
				var data = {};
				var mcontent = '';

				//Data for API upload file
				if (params.file) {
					data = {
						timestamp: timestamp,
						oaid: this.options('oaid'),
						file: params.file
					};
					isMultipart = true;
					mcontent = data.oaid + data.timestamp + this.options('secretkey');
				} else {
					data = {
						timestamp: timestamp,
						oaid: this.options('oaid'),
						data: params
					};
					mcontent = data.oaid + (0, _stringify2.default)(data.data) + data.timestamp + this.options('secretkey');
				}
				data.mac = _crypto2.default.createHash('sha256').update(mcontent, 'utf8').digest('hex');
				formOptions = postParamData(data);
			} else {
				var _mcontent = '';
				var keys = (0, _keys2.default)(params);

				keys.map(function (k) {
					var v = params[k];
					if ((typeof v === 'undefined' ? 'undefined' : (0, _typeof3.default)(v)) == 'object') {
						_mcontent += (0, _stringify2.default)(v);
					} else _mcontent += v;
				});

				params.oaid = this.options('oaid');
				params.timestamp = timestamp;

				_mcontent = params.oaid + _mcontent + params.timestamp + this.options('secretkey');
				params.mac = _crypto2.default.createHash('sha256').update(_mcontent, 'utf8').digest('hex');
				url += stringifyParams(params);
			}

			requestOptions = {
				method: method,
				url: url,
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

			_logger.debug('Request Options ' + (0, _stringify2.default)(requestOptions));

			(0, _request2.default)(requestOptions, function (error, response, body) {
				if (error !== null) return cb(error);

				var json = void 0;
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
			});
		}
	}, {
		key: 'options',
		value: function options(keyOrOptions) {
			var opt = this[_opts];
			if (!keyOrOptions) return opt;

			if (typeof keyOrOptions == 'string' && verifyOptionField(keyOrOptions)) {
				return opt[keyOrOptions];
			}

			if (keyOrOptions && (typeof keyOrOptions === 'undefined' ? 'undefined' : (0, _typeof3.default)(keyOrOptions)) == 'object') {
				var keys = (0, _keys2.default)(keyOrOptions);
				for (var k in opt) {
					if (verifyOptionField(k) && keys.indexOf(k) != -1) {
						opt[k] = keyOrOptions[k];
					}
				}
			}
		}
	}]);
	return ZaloOA;
}(), (_applyDecoratedDescriptor(_class.prototype, 'api', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'api'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'options', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'options'), _class.prototype)), _class);
var ZOA = exports.ZOA = new ZaloOA();
exports.default = ZOA;
exports.ZaloOA = ZaloOA;
exports.ZaloApiException = _ZaloApiException2.default;
exports.version = version;