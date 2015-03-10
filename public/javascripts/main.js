var app = angular.module('app', ['ngResource', 'ngRoute']);

app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
		.when('/home', {
	        controller: 'ScoreController',
	        templateUrl: 'views/home.hjs'
	    })
	    .when('/setAlias', {
	        controller: 'AliasController',
	        templateUrl: 'views/setAlias.hjs'
	    })
		.otherwise({
	        redirectTo: '/home'
	    });
	}
]);