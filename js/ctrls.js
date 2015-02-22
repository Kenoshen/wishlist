var app = angular.module("wishlistApp");
//
app.controller("DetailUserCtrl", function($scope, $rootScope) {
	$rootScope.curPath = "detailUser";
	$rootScope.backPath = "home";
	if (! ($rootScope.currentWishlist)){
		$rootScope.getPathParameters();
	}
});
app.controller("NewListCtrl", function($scope, $rootScope) {
	$rootScope.curPath = "newList";
	$rootScope.backPath = "detailUser";
	if (! ($rootScope.currentWishlist)){
		$rootScope.getPathParameters();
	}
});
app.controller("DetailListCtrl", function($scope, $rootScope) {
	$rootScope.curPath = "detailList";
	$rootScope.backPath = "detailUser";
	$scope.markAs = function(item){
		$rootScope.updateWishlistItemStatus($rootScope.currentUser._id, null, $rootScope.currentWishlist.name, item._id, item.status);
	};
	$scope.move = function(item, numToMove){
		var curIndex = -1;
		for (var i = 0; i < $rootScope.currentWishlist.items.length; i++){
			if ($rootScope.currentWishlist.items[i]._id === item._id){
				curIndex = i;
				break;
			}
		}
		var desiredIndex = curIndex + numToMove;
		console.log("%s: %s, %s", item.name, curIndex, desiredIndex);
		if (desiredIndex >= 0 && desiredIndex < $rootScope.currentWishlist.items.length){
			$rootScope.moveWishlistItem($rootScope.creds.user, $rootScope.creds.pass, $rootScope.currentWishlist.name, item._id, desiredIndex);
			$rootScope.currentWishlist.items.splice(curIndex, 1);
			$rootScope.currentWishlist.items.splice(desiredIndex, 0, item);
		}
	};
	if (! ($rootScope.currentWishlist)){
		$rootScope.getPathParameters();
	}
});

app.controller("NewItemCtrl", function($scope, $rootScope) {
	$rootScope.curPath = "newItem";
	$rootScope.backPath = "detailList";
	if (! ($rootScope.currentWishlist)){
		$rootScope.getPathParameters();
	}
});

app.controller("EditItemCtrl", function($scope, $rootScope) {
	$rootScope.curPath = "editItem";
	$rootScope.backPath = "detailList";

	$scope.save = function(item){
		console.log("%s", item._id);
		$rootScope.updateWishlistItem($rootScope.creds.user, $rootScope.creds.pass, $rootScope.currentWishlist.name, item._id, item, function(){
			$rootScope.back();
		});
	};

	$scope.delete = function(item){
		$rootScope.deleteWishlistItem($rootScope.creds.user, $rootScope.creds.pass, $rootScope.currentWishlist.name, item._id, function(){
			var curIndex = -1;
			for (var i = 0; i < $rootScope.currentWishlist.items.length; i++){
				if ($rootScope.currentWishlist.items[i]._id === item._id){
					curIndex = i;
					break;
				}
			}
			if (curIndex >= 0){
				$rootScope.currentWishlist.items.splice(curIndex, 1);
			}
			$rootScope.back();
		});
	};

	if (! ($rootScope.currentWishlist)){
		$rootScope.getPathParameters();
		$scope.item = $rootScope.currentItem;
	}
});