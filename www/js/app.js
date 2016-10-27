// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngStorage','btford.socket-io','jett.ionic.filter.bar','satellizer','ngCordova'])

    .run(function ($ionicPlatform, $rootScope) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
       
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html',				
				cache: false
            })

            // Each tab has its own nav history stack:

            .state('tab.activities', {
                url: '/activities',
                views: {
                    'tab-activities': {
                        templateUrl: 'templates/tab-activities.html',
                        controller: 'ActivitiesCtrl',
						cache: false
                    }
                }
            })      

            .state('tab.friends', {
                url: '/friends',             
                views: {
                    'tab-friends': {
                        templateUrl: 'templates/tab-friends.html',
                        controller: 'FriendsCtrl',
						cache: false
                    }
                }
            })
         
            .state('tab.group_making', {
                url: '/group_making',
                views: {
                    'tab-group-making': {
                        templateUrl: 'templates/tab-friends.html',
                        controller: 'FriendsCtrl',
						cache: false
                    }
                }
            })
			
			.state('tab.account', {
                url: '/account',
				 views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl',
						cache: false
                    }
                }
              
				
            })

			
			 .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
				controller: 'LoginCtrl'
				
            })


         

        // if none of the above states are matched, use this as the fallback
       $urlRouterProvider.otherwise(function($injector, $location) {
			var $state = $injector.get('$state')
			var $localStorage = $injector.get('$localStorage');

			var defaultState;
			if($localStorage.user !=null && $localStorage.user.phone_number !=null)
				defaultState = 'tab.friends';			
			else
				defaultState = 'login';
			$state.go(defaultState)        
		})

    });

