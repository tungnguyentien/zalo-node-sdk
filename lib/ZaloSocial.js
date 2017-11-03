'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.version = exports.ZaloApiException = exports.ZaloSocial = exports.ZS = undefined;

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

var _coreDecorators = require('core-decorators');

var _ZaloApiException = require('./ZaloApiException');

var _ZaloApiException2 = _interopRequireDefault(_ZaloApiException);

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
	accessToken: null,
	appId: null,
	appSecret: '',
	version: 'v2.0',
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

	for (var key in params) {
		var value = params[key];
		if (value && (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
			value = (0, _stringify2.default)(value);
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
};

var _opts = (0, _symbol2.default)('opts');
var graph = (0, _symbol2.default)('graph');
var oauthRequest = (0, _symbol2.default)('oauthRequest');

var ZaloSocial = (_class = function () {
	function ZaloSocial(opts, _internalInherit) {
		(0, _classCallCheck3.default)(this, ZaloSocial);

		_logger.debug('opts: ' + (0, _stringify2.default)(opts));
		_logger.debug('_internalInherit: ' + _internalInherit);

		if (_internalInherit instanceof ZaloSocial) {
			this[_opts] = (0, _create2.default)(_internalInherit[_opts]);
		} else {
			this[_opts] = (0, _create2.default)(defaultOptions);
		}

		if ((typeof opts === 'undefined' ? 'undefined' : (0, _typeof3.default)(opts)) === 'object') {
			this.options(opts);
		}
	}

	(0, _createClass3.default)(ZaloSocial, [{
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
	}, {
		key: oauthRequest,
		value: function value(path, method, params, cb) {
			var url, requestOptions, formOptions;
			cb = cb || function () {};
			url = 'https://graph.zalo.me/' + this.options('version') + '/' + path;

			if (!params.access_token) params.access_token = this.options('accessToken');
			if (method == 'POST') {
				formOptions = postParamData(params);
			} else {
				url += stringifyParams(params);
			}

			requestOptions = {
				method: method,
				url: url,
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
		key: 'getAccessToken',
		value: function getAccessToken() {
			return this.options('accessToken');
		}
	}, {
		key: 'getAccessTokenByOauthCode',
		value: function getAccessTokenByOauthCode(oauthCode, cb) {
			var appId = this.options('appId');
			var appSecret = this.options('appSecret');

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
				cb = function cb(res) {
					if (res != null && res.access_token) {
						this.options({ accessToken: res.access_token });
					}
				};
			}

			var url = 'https://oauth.zaloapp.com/v3/access_token?app_id=' + appId + '&app_secret=' + this.options('appSecret') + '&code=' + oauthCode;
			var requestOptions = {
				url: url,
				method: 'GET',
				headers: {
					'SDK-Source': ['NodeSDK', version].join('-')
				}
			};
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
		key: 'setAccessToken',
		value: function setAccessToken(accessToken) {
			this.options({ accessToken: accessToken });
		}
	}, {
		key: 'getLoginUrl',
		value: function getLoginUrl() {
			var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var appId = opt.appId || this.options('appId');
			var redirectUri = opt.redirectUri || this.options('redirectUri');

			if (!appId) {
				throw new Error('appId required');
			}

			if (!redirectUri) {
				throw new Error('redirectUri required');
			}

			return 'https://oauth.zaloapp.com/v3/auth?app_id=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUri);
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
	return ZaloSocial;
}(), (_applyDecoratedDescriptor(_class.prototype, 'api', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'api'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getAccessToken', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAccessToken'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getAccessTokenByOauthCode', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAccessTokenByOauthCode'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setAccessToken', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'setAccessToken'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLoginUrl', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getLoginUrl'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'options', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'options'), _class.prototype)), _class);
var ZS = exports.ZS = new ZaloSocial();
exports.default = ZS;
exports.ZaloSocial = ZaloSocial;
exports.ZaloApiException = _ZaloApiException2.default;
exports.version = version;