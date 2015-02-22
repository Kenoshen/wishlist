var app = angular.module("wishlistApp", ["ngRoute", "user", "wishlist"]);

app.run(function($rootScope, $http, $location, $timeout, userAuth, userApi, wishlistApi){
	$rootScope.curPath = "home";
	$rootScope.backPath = null;
	$http.defaults.headers.common["Content-Type"] = 'application/json';
	
	$rootScope.wishlists = null;
	$rootScope.currentWishlist = null;
	$rootScope.currentItem = null;
	$rootScope.users = [];
	$rootScope.currentUser = null;
	$rootScope.pathParams = {};
	$rootScope.authedUser = null;

	// ///////////////////////////////////////////
	//  API methods
	// ///////////////////////////////////////////
	$rootScope.getPublicWishlists = function(success, failure){
		wishlistApi.getPublicWishlists(success, failure);
	};
	$rootScope.getUser = function(userId, password, success, failure){
		userApi.getUser(userId, password, success, failure);
	};
	$rootScope.updateWishlistItem = function(userId, password, wishlist, item, info, success, failure){
		wishlistApi.updateWishlistItem(userId, password, wishlist, item, info, success, failure);
	};
	$rootScope.updateWishlistItemStatus = function(userId, password, wishlist, item, status, success, failure){
		wishlistApi.updateWishlistItemStatus(userId, password, wishlist, item, status, success, failure);
	};
	$rootScope.moveWishlistItem = function(userId, password, wishlist, item, index, success, failure){
		wishlistApi.moveWishlistItem(userId, password, wishlist, item, index, success, failure);
	};
	$rootScope.deleteWishlistItem = function(userId, password, wishlist, item, success, failure){
		wishlistApi.deleteWishlistItem(userId, password, wishlist, item, success, failure);
	};

	// ///////////////////////////////////////////
	//  Helper methods
	// ///////////////////////////////////////////
	$rootScope.focusOn = function(selector){
		$timeout(function(){$(selector).focus();}, 1);
	};

	$rootScope.addHTTPPrefix = function(str){
		if (str){
			str = str.trim();
			if (str.search("http://") != 0 && str.search("https://") != 0){
				return "http://" + str;
			} else {
				return str;
			}
		}
		return null;
	};

	$rootScope.userForId = function(userId){
		for (var i = 0; i < $rootScope.users.length; i++){
			if ($rootScope.users[i]._id === userId){
				return $rootScope.users[i];
			}
		}
		return null;
	};

	$rootScope.addUserIfNotThere = function(userId, callback){
		var potentialUser = $rootScope.userForId(userId);
		if (potentialUser){
			if (callback){
				callback(potentialUser);
			}
		} else {
			$rootScope.getUser(userId, null, function(data){
				$rootScope.users.push(data);
				if (callback){
					callback(data);
				}
			}, function(data){
				if (callback){
					callback(null);
				}
			});
		}
	};

	$rootScope.authedUser = function(){
		if ($rootScope.currentUser && $rootScope.currentUser._id && $rootScope.creds && $rootScope.creds.user){
			return ($rootScope.currentUser._id === $rootScope.creds.user);
		}
		return false;
	};

	$rootScope.wishlistForOwnerIdAndName = function(ownerId, name){
		if ($rootScope.wishlists){
			for (var i = 0; i < $rootScope.wishlists.length; i++){
				if ($rootScope.wishlists[i]._owner === ownerId && $rootScope.wishlists[i].name === name){
					return $rootScope.wishlists[i];
				}
			}
		}
		return null;
	};

	$rootScope.wishlistsForOwnerId = function(ownerId){
		var wishlists = [];
		for (var i = 0; i < $rootScope.wishlists.length; i++){
			if ($rootScope.wishlists[i]._owner === ownerId){
				wishlists.push($rootScope.wishlists[i]);
			}
		}
		return wishlists;
	};

	$rootScope.itemForId = function(wishlist, itemId){
		if (wishlist){
			for (var i = 0; i < wishlist.items.length; i++){
				if (wishlist.items[i]._id === itemId){
					return wishlist.items[i];
				}
			}
		}
		return null;
	};

	$rootScope.getPathParameters = function(){
		var split = $rootScope.path().split("/");
		$rootScope.pathParams = {
			user: split[1],
			wishlist: split[2],
			item: split[3],
			newList: (split[2] === "new"),
			newItem: (split[3] === "new")
		};
		if ($rootScope.pathParams.user){
			$rootScope.currentUser = $rootScope.userForId($rootScope.pathParams.user);	
		}
		if ($rootScope.pathParams.wishlist){
			$rootScope.currentWishlist = $rootScope.wishlistForOwnerIdAndName($rootScope.pathParams.user, $rootScope.pathParams.wishlist);
		}
		if ($rootScope.pathParams.item){
			$rootScope.currentItem = $rootScope.itemForId($rootScope.currentWishlist, $rootScope.pathParams.item);
		}
	};

	// ///////////////////////////////////////////
	//  Routing
	// ///////////////////////////////////////////
	$rootScope.go = function(path){
		console.log("GO:", path);
		$location.path(path);
	};

	$rootScope.path = function(){
		var temp = $location.path();
		//console.log("PATH:", temp);
		return temp;
	};

	$rootScope.isBack = function(){
		return ($rootScope.backPath !== null && $rootScope.backPath !== undefined);
	};

	$rootScope.back = function(){
		if ($rootScope.isBack()){
			if ($rootScope.backPath === "home"){
				$rootScope.home();
			} else if ($rootScope.backPath === "detailUser"){
				$rootScope.detailUser();
			} else if ($rootScope.backPath === "detailList"){
				$rootScope.detailList();
			}
		}
	};

	$rootScope.home = function(){
		$rootScope.curPath = "home";
		$rootScope.backPath = null;
		$rootScope.go("/");
	};

	$rootScope.myWishlists = function(){
		if($rootScope.userIsLoggedIn){
			$rootScope.addUserIfNotThere($rootScope.creds.user, function(user){
				if (user){
					$rootScope.detailUser(user);
				}
			});
		}
	};

	$rootScope.detailUser = function(user){
		if (user){
			$rootScope.currentUser = user
		} else {
			$rootScope.currentUser = $rootScope.userForId($rootScope.currentWishlist._owner);	
		}
		$rootScope.curPath = "detailUser";
		$rootScope.backPath = "home";
		$rootScope.go("/" + $rootScope.currentUser._id);
	};

	$rootScope.newList = function(){
		$rootScope.curPath = "newList";
		$rootScope.backPath = "detailUser";
		$rootScope.currentUser = $rootScope.userForId($rootScope.currentWishlist._owner);
		$rootScope.go("/" + $rootScope.currentWishlist._owner + "/new");
	};

	$rootScope.detailList = function(wishlist){
		if (wishlist){
			$rootScope.currentWishlist = wishlist
		}
		$rootScope.curPath = "detailList";
		$rootScope.backPath = "detailUser";
		$rootScope.currentUser = $rootScope.userForId($rootScope.currentWishlist._owner);
		$rootScope.go("/" + $rootScope.currentWishlist._owner + "/" + $rootScope.currentWishlist.name);
	};

	$rootScope.newItem = function(){
		$rootScope.curPath = "detailList";
		$rootScope.backPath = "detailList";
		$rootScope.currentUser = $rootScope.userForId($rootScope.currentWishlist._owner);
		$rootScope.go("/" + $rootScope.currentWishlist._owner + "/" + $rootScope.currentWishlist.name + "/new");
	};

	$rootScope.editItem = function(wishlist, item){
		if (wishlist){
			$rootScope.currentWishlist = wishlist
		}
		if (item){
			$rootScope.currentItem = item;
		}
		$rootScope.curPath = "detailList";
		$rootScope.backPath = "detailList";
		$rootScope.currentUser = $rootScope.userForId($rootScope.currentWishlist._owner);
		$rootScope.go("/" + $rootScope.currentWishlist._owner + "/" + $rootScope.currentWishlist.name + "/" + $rootScope.currentItem._id);
	};

	$rootScope.loginPage = function(){
		$rootScope.backPath = $rootScope.curPath;
		$rootScope.userLoginType = {signup: false};
		$rootScope.go("/login");
	};

	$rootScope.signupPage = function(){
		$rootScope.backPath = $rootScope.curPath;
		$rootScope.userLoginType = {signup: true};
		$rootScope.go("/signup");
	};

	// ///////////////////////////////////////////
	//  User auth
	// ///////////////////////////////////////////
	$rootScope.userSuccessfulLogin = function(auth){
		$rootScope.creds = userAuth.creds();
		$rootScope.userIsLoggedIn = true;
		$rootScope.addUserIfNotThere($rootScope.creds.user);
		console.log("Successfully logged in: %s", JSON.stringify(auth));
		if ($rootScope.isBack()){
			$rootScope.back();
		} else {
			$rootScope.home();
		}
	};

	$rootScope.userFailedLogin = function(data){
		$rootScope.userIsLoggedIn = false;
		console.log("Failed to log in: %s", JSON.stringify(data));
	};

	$rootScope.userSuccessfulSignup = function(auth){
		$rootScope.creds = userAuth.creds();
		$rootScope.userIsLoggedIn = true;
		$rootScope.addUserIfNotThere($rootScope.creds.user);
		console.log("Successfully signed up: %s", JSON.stringify(auth));
		if ($rootScope.isBack()){
			$rootScope.back();
		} else {
			$rootScope.home();
		}
	};

	$rootScope.userFailedSignup = function(data){
		$rootScope.userIsLoggedIn = false;
		console.log("Failed to sign up: %s", JSON.stringify(data));
	};

	$rootScope.userSuccessfulLogout = function(){
		$rootScope.userIsLoggedIn = false;
		$rootScope.creds = userAuth.creds();
		console.log("Successfully logged out");
	};

	$rootScope.logout = function(){
		userAuth.logout($rootScope.userSuccessfulLogout);
	};

	// ///////////////////////////////////////////
	//  Do once
	// ///////////////////////////////////////////
	$rootScope.getPublicWishlists(function(data){
		$rootScope.wishlists = data;
		for (var i = 0; i < $rootScope.wishlists.length; i++){
			$rootScope.addUserIfNotThere($rootScope.wishlists[i]._owner, function(user){
				$rootScope.getPathParameters();
			});
		}
	}, function(data){
		alert("Failed to get public wishlists: " + JSON.stringify(data));
	});
	$rootScope.creds = userAuth.creds();
	if ($rootScope.creds.user && $rootScope.creds.pass){
		userAuth.login($rootScope.creds.user, $rootScope.creds.pass, function(){
			$rootScope.creds = userAuth.creds();
			$rootScope.userIsLoggedIn = true;
		}, function(){
			userAuth.logout();
			$rootScope.creds = userAuth.creds();
		});
	}
});



app.config(function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl : '../html/user/login.html'
	}).when('/signup', {
		templateUrl : '../html/user/login.html'
	}).when('/:user', {
		templateUrl : 'html/detailUser.html'
	}).when('/:user/new', {
		templateUrl : 'html/newList.html'
	}).when('/:user/:wishlist', {
		templateUrl : 'html/detailList.html'
	}).when('/:user/:wishlist/new', {
		templateUrl : 'html/newItem.html'
	}).when('/:user/:wishlist/:item', {
		templateUrl : 'html/editItem.html'
	}).otherwise({
		templateUrl : 'html/home.html'
	});
});


