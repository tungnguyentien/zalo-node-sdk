# Zalo SDK NodeJs

Zalo SDK is a library of functions that support Zalo Login and call OpenAPI.
With Zalo SDK, you can easily use Open APIs of Zalo.

## Getting Started

These instructions will get you a copy of the project up and run on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

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
Click to view [Zalo Developer Documentation For Open API](https://developers.zalo.me/docs/api/open-api-4).

**Create an instance of the ZaloSocial class**
```js
var ZaloSocial = require('zalo-sdk').ZaloSocial;

var zsConfig = {
	appId: '1131677296116040198',
	redirectUri: 'http://localhost/login/zalo-callback',
	secretkey: 'your app secret'
};
var ZSClient = new ZaloSocial(zsConfig);
```
Before call any API, you must have **Access Token** . You can get **Access Token** by **Oauth Code** and set value of access_token after you initialize ZaloSocial Instance , (access_token will be exipred in 3600s). Click [Social API Document](https://developers.zalo.me/docs/api/social-api/tai-lieu/bat-dau-nhanh-post-1011) to see how to get **Oauth Code** for your App.

```js
var code = 'Your oauth code';
ZSClient.getAccessTokenByOauthCode(code, function(response) {
	if (response && response.access_token) {
		ZSClient.setAccessToken(response.access_token);
	}
});
```

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
Format Login Url: https://oauth.zaloapp.com/v3/auth?app_id={1}&redirect_uri={2}
```
**Login Flow**
1. Get login URL via  ZSClient.getLoginUrl();
2. After User login Zalo, Zalo Server will redirect to callback URL of App with OAuth Code and UserId. You can use this code to get Access Token via ZSClient.getAccessTokenByOauthCode(code).
3. Get User's Profile by userId to verify User.

## Use Official Account Open API
Provides a way for your application to access data on Zalo's platform. Through the HTTPS protocol, applications can interact with interested people on behalf of the Zalo Official Account.

To use the Official Account Open API you need to create an official account and register as 3rd party and follow the terms of Zalo.

Click to view [Zalo Developer Documentation For Official Account Open API](https://developers.zalo.me/docs/api/official-account-open-api-5).

**Create an instance of the ZaloOA class**
```js
var ZaloOA = require('zalo-sdk').ZaloOA;

var zaConfig = {
	oaid: '2491302944280861639',
	secretkey: 'your secret key'
}
var ZOAClient = new ZaloOA(zaConfig);
```

**Get Profile Follower**
```js
var userId = 'user id or phone number';
ZOAClient.api('getprofile', { uid: userId }, function(response) {
	console.log(response);
})
```
**Send Text Message**
```js
var userId = 'user id';
ZOAClient.api('sendmessage/text', 'POST', {uid: userId, message: 'Zalo SDK Nodejs Test Message'}, function(response) {
	console.log(response);
})
```
**Get Message Status**
```js
ZOAClient.api('getmessagestatus', {msgid: 'fdb4c7ad668f37d16e9e'}, function(response) {
	console.log(response);
})
```
**Upload Image**
```js
var fileUrl = 'url of file you want to upload or absolute file path';
ZOAClient.api('upload/image','POST', {file: fileUrl}, function(response) {
	console.log(response);
})
```
**Upload Image Gif**
```js
var fileUrl = 'url of file you want to upload or absolute file path';
ZOAClient.api('upload/gif','POST', {file: fileUrl}, function(response) {
	console.log(response);
})
```
**Send Image Message**
```js
ZOAClient.api('sendmessage/image', 'POST', {uid: '', message: 'Zalo SDK Nodejs', 'imageid': ''}, function(response) {
	console.log(response);
})
```
**Send Gif Message**
```js
ZOAClient.api('sendmessage/gif', 'POST', {uid: '', width: '', height: '', 'imageid': ''}, function(response) {
	console.log(response);
})
```

**Send Link Message**
```js
var params = {
	uid: '',
	links: [{
		link: 'https://developers.zalo.me/',
		linktitle: 'Zalo For Developers',
		linkdes: 'Document For Developers',
		linkthumb: 'https://developers.zalo.me/web/static/prodution/images/bg.jpg'
	}]
}
ZOAClient.api('sendmessage/links', 'POST', params, function(response) {
	console.log(response);
})
```

**Send Interactive Messages**
```js
var params = {
	uid: '',
	actionlist: [{
		action: 'oa.open.inapp',
		title: 'Send interactive messages',
		description: 'This is a test for API send interactive messages',
		thumb: 'https://developers.zalo.me/web/static/prodution/images/bg.jpg',
		href: 'https://developers.zalo.me',
		data: 'https://developers.zalo.me',
		popup: {
			title: 'Open Website Zalo For Developers',
			desc: 'Click ok to visit Zalo For Developers and read more Document',
			ok: 'ok',
			cancel: 'cancel'
		}
	}]
}
ZOAClient.api('sendmessage/actionlist', 'POST', params, function(response) {
	console.log(response);
})
```
**Send A Message Customer Support To The Phone Number**
```js
var params = {
	phone: '',
	templateid: '',
	templatedata: {}
}
ZOAClient.api('sendmessage/phone/cs', 'POST', params, function(response) {
	console.log(response);
})
```
**Send A Message Customer Support**
```js
var params = {
	uid: '',
	templateid: '',
	templatedata: {}
}
ZOAClient.api('sendmessage/cs', 'POST', params, function(response) {
	console.log(response);
})
```
**Send Sticker**
```js
ZOAClient.api('sendmessage/sticker', 'POST', {uid: '', stickerid: ''}, function(response) {
	console.log(response);
})
```

**Reply Text Messages**
```js
ZOAClient.api('sendmessage/reply/text', 'POST', {msgid: '', message: ''}, function(response) {
	console.log(response);
})
```
**Reply Image Messages**
```js
ZOAClient.api('sendmessage/reply/image', 'POST', {msgid: '', imageid: '', message: ''}, function(response) {
	console.log(response);
})
```
**Reply Link Messages**
```js
ZOAClient.api('sendmessage/reply/links', 'POST', {msgid: '', links: ''}, function(response) {
	console.log(response);
})
```

**Create QR Code**
```js
ZOAClient.api('qrcode', 'POST', {qrdata: '', size: ''}, function(response) {
	console.log(response);
})
```

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We will update more features in next version.

## Authors

* **Tung Nguyen** 
## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


