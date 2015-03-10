var app = angular.module('app');

app.factory("ServerService", ['$http', function($http) {
  return {
    getUsers: function() {
      return $http.get("/getUsers");
    },
    // Send ID and alias to be set to that user
    sendAlias: function(info) {
      var promise = $http.post("/postAlias", info).then(function(response) {
        return response.data;
      });
      return promise;
    },
    sendUser: function(newUser) {
      var promise = $http.post("/postUser", newUser).then(function(response) {
        return response.data;
      });
      return promise;
    },
    sendTime: function(info) {
      var promise = $http.post("/postTime", info).then(function(response) {
        return response.data;
      });
      return promise;
    },
    sendComment: function(info) {
      var promise = $http.post("/postComment", info).then(function(response) {
        return response.data;
      });
      return promise;
    },
    sendRating: function(info) {
      var promise = $http.post("/postRating", info).then(function(response) {
        return response.data;
      });
      return promise;
    }
  }
}]);