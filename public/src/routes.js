(function(){

	'use strict';

	angular.module('secrets', ['ui.router']);

	angular.module('secrets')
	.config(routeConfig);

	routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
	function routeConfig($stateProvider, $urlRouterProvider){

		$urlRouterProvider.otherwise('/');

		$stateProvider
		.state('welcome', {
			url: '/',
			templateUrl: 'src/templates/welcome.html'
		})
		.state('signup', {
			url: '/signup',
			templateUrl: 'src/templates/signup.html'
		})
		.state('login', {
			url: '/login',
			templateUrl: 'src/templates/login.html'
		})
		.state('userpage',{
			abstract: true,
			templateUrl: 'src/templates/userpage.html'
		})
		.state('userpage.home', {
			url: '/userpage/home',
			templateUrl: 'src/templates/userpage-home.html'
		})
		.state('userpage.newpost', {
			url: '/userpage/newpost',
			templateUrl: 'src/templates/userpage-newpost.html'
		})
		.state('userpage.myposts', {
			url: '/userpage/myposts',
			templateUrl: 'src/templates/userpage-myposts.html'
		})
		.state('userpage.posted', {
			url: '/userpage/posted',
			templateUrl: 'src/templates/userpage-posted.html'
		});
	}
})();