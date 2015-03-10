var app = angular.module('app');

app.controller("AliasController", 
  ['$scope', '$location', 'ServerService', 'GameService', 
  function($scope, $location, ServerService, GameService) {

  $("#canvas").fadeOut(0);

  $scope.newUser = {};

  $scope.go = function (path) {
    $location.path(path);
  	GameService.restartLevel();
    $("#canvas").fadeIn();
  }

  $scope.setAlias = function() {
    if($scope.newUser.alias == "" &&
       $scope.newUser.alias != null) {
      alert("You have not chosen an alias!");
    }
    else {
      ServerService.sendAlias({
        "alias": $scope.newUser.alias,
        "id": $scope.myID
      }).then(function(data) {
      	if(data[0] == "2") {
      		alert("Alias already taken");
      		return;
      	}

        var incData = {};
        var userArray = $scope.users;

        angular.forEach(data, function(value, key) {
          if(key == "alias") incData.alias = value;
          else console.log("dont care");
        });
      });
      $scope.newUser.alias = "";
      $scope.go("/home");
    }
  }
}]);