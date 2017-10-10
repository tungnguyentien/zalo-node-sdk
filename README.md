# Zalo SDK NodeJs

Zalo SDK is a library of functions that support Zalo Login and call OpenAPI.
With Zalo SDK, you can easily use Open APIs of Zalo.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing Zalo SDK NodeJs

**Install with:**

```
npm install --save zalo-sdk
```

**And import to your project:**

```js
// Using require() in ES5 
var Zalo = require('zalo-sdk');
```

## Use Social API
Provides a way for your application to access data on Zalo's platform. Through the HTTP protocol, applications can query user data, friend data, post new information, and more.

To use the Social API, you need to register for the application on Zalo and follow the terms of Zalo. 
Click [here](https://developers.zalo.me/docs/api/open-api-4) to view document on Zalo.

**Create an instance of the ZaloSocial class**
```js
var Zalo = require('zalo-sdk');
var ZaloSocial = Zalo.ZaloSocial;
var config = {
	appId: '1131677296116040198',
	redirectUri: 'http://localhost/login/zalo-callback',
	accessToken: 'your access token'
};
var ZSClient = new ZaloSocial(config);
```
You can get **Access Token** of your App at [here](https://developers.zalo.me/tools/explorer)

**Access User Information**
```js
ZSClient.api('me', 'GET', { fields: 'id, name, birthday, gender, picture' }, function(response) {
	console.log(response);
});
```
**Access Friends List**
```js
ZSClient.api('me/friends', function(response) {
	console.log(response);
});

//Get list of your friends with offset and limit
ZSClient.api('me/friends', {offset: 10, limit: 50}, function(response) {
	console.log(response);
});

//Get  list of your friends who you can intvite to use your App.
ZSClient.api('me/invitable_friends', {offset: 10, limit: 50, fields: 'id, name, picture'}, function(response) {
	console.log(response);
});
```
**Post Feed**
```js
ZSClient.api('me/feed', 'POST', {message: 'Lorem ipsum dolor sit amet !', link: 'https://developers.zalo.me/'}, function(response) {
	console.log(response);
});
```
**Invite To Use The App**
```js
ZSClient.api('apprequests', 'POST', {to: '8549377444104328082', message: 'Lorem ipsum dolor sit amet !'},  function(response) {
	console.log(response);
});
```
**Send A Message To Friends**
```js
ZSClient.api('me/message', 'POST', {to: '8549377444104328082', message: 'Lorem ipsum dolor sit amet !', link: 'https://developers.zalo.me/'},  function(response) {
	console.log(response);
});
```

**Get Login Url**
```js
var loginUrl = ZSClient.getLoginUrl();

```
## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

Current version is 1.0.0. We will update more features in next version.

## Authors

* **Tung Nguyen** 
## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


