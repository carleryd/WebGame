var app = angular.module('app');

app.controller("ScoreController", 
  ['$scope', '$location', 'ServerService', 'GameService', 
  function($scope, $location, ServerService, GameService) {
  
  $scope.maxLevel = 7;
  $scope.averageRating = [];
  $scope.newUser = {};
  $scope.myUser = { id: "12345", alias: "noname", ratings: [ 0, 0, 0, 0, 0, 0, 0 ] };
  // When not logged in, $scope.myID is set to "1234" from the server.
  // This will not correspond to any stored users.
  // Users are created on the database on /login/verify
  $scope.myID;
  // The GameService is located in Game.js which is part of the canvas-game
  $scope.currentLevel = GameService.getCurrentLevel();
  $scope.finishTime = 999 * 1000;

  // Rating circles
  // On click, remove all marked circles and add the chosen amount
  $('.rating input').click(function () {
      $(".rating span").removeClass('checked');
      $(this).parent().addClass('checked');
  });

  $('input:radio').change(
    function() {
        $scope.postRating(this.value);
  });

  // I initialize the array instead of just pushing because I want to access array
  // using array[currentLevel-1] because its more effective than looking for correct level
  // using a for-loop each time
  for(var i = 0; i < $scope.maxLevel; i++) {
    $scope.averageRating.push({ "total": 0, "count": 0 });
  }

  // In these functions I run $scope.$apply() because otherwise angular wont know
  // that $scope.finishTime has changed
  $scope.updateFinishTime = function() {
    $scope.finishTime = GameService.getFinishTime();
    $scope.$apply();
    $scope.postTime();
  }
  $scope.updateCurrentLevel = function() {
    $scope.currentLevel = GameService.getCurrentLevel();
    $scope.$apply();
    $scope.updateRatingMarks();
  }

  $scope.nextLevel = function() {
    GameService.nextLevel();

    $scope.currentLevel++;
    if($scope.currentLevel > $scope.maxLevel)
      $scope.currentLevel = 1;

    $scope.updateRatingMarks();
  }

  $scope.previousLevel = function() {
    GameService.previousLevel();

    $scope.currentLevel--;
    if($scope.currentLevel < 1)
      $scope.currentLevel = $scope.maxLevel;

    $scope.updateRatingMarks();
  }

  $scope.updateRatingMarks = function() {
    $(".rating span").removeClass('checked');
    $('.rating input[value=' + 
      parseInt($scope.myUser.ratings[$scope.currentLevel-1]) + 
      ']').parent().addClass('checked');
  }

  $scope.restartLevel = function() {
    GameService.restartLevel();
  }

  $scope.go = function (path) {
    $location.path(path);
  }

  $scope.userInfo = function() { // newUser-
    if($scope.myUser.id == "12345") return "You are not logged in";
    else {
      return "Logged in as " + $scope.myUser.alias
    }
  }

  $scope.printDate = function(data) {
    var date = data.split("T")[0];
    var time = data.split("T")[1];
    time = time.substring(0, time.length-8);

    return "Posted " + date + " at " + time;
  }

  $scope.printUser = function(user) {
    return user.alias + "&#09" + user.levels[$scope.currentLevel-1].time;
  }

  $scope.getServerScores = function() {
    ServerService.getUsers().success(function(data) {
      // Change this solution to instead check which data we dont have
      $scope.users = [];
      $scope.comments = [];
      angular.forEach(data, function(user) {
        $scope.users.push({
          id: user.id,
          alias: user.alias,
          levels: user.levels
        });
        // Calculate average rating
        for(var a = 0; a < $scope.maxLevel; a++) {
          if(user.levels[a].rating != 999) {
            if(user.id == $scope.myID) {
              $scope.myUser.ratings[a] = user.levels[a].rating;
            }
              console.log($scope.myUser.alias);
            $scope.averageRating[a].total += user.levels[a].rating;
            $scope.averageRating[a].count++;
          }
        }
        // Locally store this users ID
        if(user.id == $scope.myID) {
          console.log("Updated!");
          $scope.myUser.id = user.id;
          $scope.myUser.alias = user.alias;
          $scope.updateRatingMarks();
        }
      });
      // One place for all comments(needed in order to print in order of time-first)
      for(var a = 0; a < $scope.users.length; a++) {
        for(var b = 0; b < $scope.maxLevel; b++) {
          for(var c = 0; c < $scope.users[a].levels[b].comments.length; c++) {
            $scope.comments.push({
              comment: $scope.users[a].levels[b].comments[c],
              alias: $scope.users[a].alias,
              level: b+1
            });
          }
        }
      }
    })
    .error(function() {
      alert("error retrieving users!");
    });
  };

  // We want them initially loaded when entering pages
  $scope.getServerScores();

  $scope.validLevel = function() {
    if($scope.newUser != null &&
       $scope.currentLevel != "" &&
       $scope.currentLevel > 0 &&
       $scope.currentLevel < 8) return true;
    else return false;
  }

  $scope.averageScore = function() {
    if(!$scope.validLevel()) return "";

    var average = 0;
    var count = 0;

    for(var i = 0; i < userArray.length; i++) {
      if(userArray[i].levels[$scope.currentLevel-1].rating != 999) {
        average += userArray[i].levels[$scope.currentLevel-1].rating;
        count++;
      }
    }
    return (parseFloat(average / count));
  }

  $scope.validTime = function(user) {
    if($scope.validLevel()) {
      $scope.time = "levels["
        + ($scope.currentLevel-1)
        + "].time";

      return user.levels[$scope.currentLevel-1].time < 999;
    }
    else return false;
  }

  $scope.validPostLevel = function(post) {
    if(post.level == $scope.currentLevel) return true;
    else return false;
  }

  $scope.getAverageRating = function() {
    if($scope.validLevel()) {
      var avg = ($scope.averageRating[$scope.currentLevel-1].total / 
                 $scope.averageRating[$scope.currentLevel-1].count);
      if(avg > 0 && avg < 8) return avg.toFixed(2) + " from " +
        $scope.averageRating[$scope.currentLevel-1].count + " votes";
    }
    return "";
  }

  $scope.postTime = function() {
    if($scope.myUser.alias == "noname" ||
       $scope.currentLevel < 0 ||
       $scope.currentLevel > $scope.maxLevel ||
       $scope.finishTime == "") {
      console.log("newUser set incorrectly!");
    }
    else {
      ServerService.sendTime({
          "alias": $scope.myUser.alias,
          "level": $scope.currentLevel,
          "time": $scope.finishTime
      }).then(function(data) {
        if(data[0] == "1") {
          console.log("user not found");
          return;
        }
        if(data[0] == "2") {
          console.log("faster time registered");
          return;
        }

        var incData = [];
        var userArray = $scope.users;
        
        angular.forEach(data, function(value, key) {
          switch(key) {
            case "alias": incData.alias = value;
            case "level": incData.level = value;
            case "time": incData.time = value;
          }
        });

        for(var i = 0; i < userArray.length; i++) {
          if($scope.users[i].alias == incData.alias) {
            $scope.users[i].levels[incData.level-1].time = incData.time;
          }
        }
      });
    }
    $scope.newUser.time = "";
  }

  $scope.postRating = function(value) {
    if(value < 0 || value > 6) {
      console.log("newUser set incorrectly!");
    }
    else {
      $scope.myUser.ratings[$scope.currentLevel-1] = value;
      ServerService.sendRating({
        "alias": $scope.myUser.alias,
        "level": parseInt($scope.currentLevel),
        "rating": value
      }).then(function(data) {
        // 0 return from server indicates incorrect incoming data
        if(data[0] == "1") {
          console.log("user not found");
          return;
        }

        var incData = {};
        var userArray = $scope.users;

        angular.forEach(data, function(value, key) {
          switch(key) {
            case "alias": incData.alias = value;
            case "level": incData.level = value;
            case "rating": incData.rating = value;
          }
        });

        for(var i = 0; i < userArray.length; i++) {
          if($scope.users[i].alias == incData.alias) {
            console.log(typeof incData.rating);
            console.log(incData.rating);
            if($scope.users[i].levels[incData.level-1].rating != 999) {
              $scope.averageRating[incData.level-1].total -=
                $scope.users[i].levels[incData.level-1].rating;
              $scope.averageRating[incData.level-1].count--;
            }
            $scope.users[i].levels[incData.level-1].rating = parseInt(incData.rating);
            $scope.averageRating[incData.level-1].total += parseInt(incData.rating);
            $scope.averageRating[incData.level-1].count++;
          }
        }
      });
      $scope.newUser.rating = "";
    }
  }

  $scope.postComment = function() {
    if($scope.myUser.alias == "noname" ||
       $scope.currentLevel < 0 ||
       $scope.currentLevel > $scope.maxLevel ||
       $scope.newUser.text == "") {
      console.log("newUser set incorrectly!");
    }
    else {
      ServerService.sendComment({
        "alias": $scope.myUser.alias,
        "level": $scope.currentLevel,
        "text": $scope.newUser.text,
        "date": new Date()
      }).then(function(data) {
        if(data[0] == "1") {
          console.log("user not found");
          return;
        }

        var incData = [];
        var userArray = $scope.users;

        angular.forEach(data, function(value, key) {
          switch(key) {
            case "alias": incData.alias = value;
            case "level": incData.level = value;
            case "text": incData.text = value;
            case "date": incData.date = value;
          }
        });

        $scope.comments.push({
          comment: {
            text: incData.text,
            date: incData.date
          },
          alias: incData.alias,
          level: $scope.currentLevel
        });
      });
    }
    $scope.newUser.text = "";
  }
}]);