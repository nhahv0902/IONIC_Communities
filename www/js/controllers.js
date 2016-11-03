angular.module('starter.controllers', [])

.controller('MainCtrl', function ($ionicHistory,$rootScope, $scope, Data, $localStorage) {
	console.log('MainCtrl');
	Data.init();



	if($localStorage.user.phone_number){			
		Data.getProfile($localStorage.user.phone_number);
			 	//update online
			 	Data.getMembers($localStorage.user.phone_number).then(function (data) {
			 		Data.updateViewData($localStorage.members[0]);

			 	});
			 }	

			 $rootScope.$on('$stateChangeSuccess', 
			 	function(event, toState, toParams, fromState, fromParams){
			 		var stateName = $ionicHistory.currentStateName();
				 //alert(stateName);
				 if(stateName == 'tab.activities'){
				 	$rootScope.show_company = false;
				 	$rootScope.title ='Recent';
				 	$rootScope.tab_friends = false;
				 }
				 if(stateName == 'tab.friends'){
				 	$rootScope.show_company = true;
				 	$rootScope.title ='Friends'; 
				 	$rootScope.tab_friends = true;
				 	$rootScope.isGroupMaking = false;
				 }					 
				 
				 if(stateName == 'tab.group_making'){
				 	$rootScope.show_company = false;
				 	$rootScope.title ='';
				 	$rootScope.tab_friends = true;
				 	$rootScope.isGroupMaking = true;
				 }

				 if(stateName == 'tab.account'){
				 	$rootScope.show_company = true;
				 	$rootScope.title ='Info at';
				 	$rootScope.tab_friends = false;
				 }
				 
				})




			})


.controller('LoginCtrl', function ($rootScope, $scope, Data, $state, $localStorage, signaling,$auth) {


	$scope.setting ={};

	$scope.setPhoneNumber = function ()  {	
		Data.init();			
		$localStorage.user.phone_number = $scope.setting.phone_number;	
		
		Data.getProfile($localStorage.user.phone_number).then(function (data) {
			if(!data.secret){
				$rootScope.is_active_code = true;
			}else{
						//web_token								
						$auth.setToken(data.secret);

						Data.getMembers($localStorage.user.phone_number).then(function (data) {
							Data.updateViewData($localStorage.members[0]);
							$state.go('tab.account');	

						});					


					}

				});

			//socket.io
			//signaling.emit('login', $localStorage.user);
			
			
		}
		
		$scope.setActiveCode = function ()  {
			
			$auth.setToken($scope.setting.active_code);	
			Data.getMembers($localStorage.user.phone_number).then(function (data) {
				Data.updateViewData($localStorage.members[0]);
				$state.go('tab.account');	
				
			});					


		}	   


	})

.controller('ActivitiesCtrl', function ($rootScope, $scope, Data, $localStorage, $ionicActionSheet, $ionicHistory, $filter) {

	
	$scope.remove = function (index)  {
			//alert(index);
			$localStorage.recents.splice(index,1);		
		}
		
		for(var i= 0; i <$localStorage.recents.length; i++){
			var recent = $localStorage.recents[i];
			if(new Date(recent.date).toDateString() != new Date().toDateString())
				recent.date_frm = $filter('date')( recent.date, 'dd-MM-yyyy');
			else
				recent.date_frm = $filter('date')( recent.date, 'HH:mm');
			
		}
		
		
		
		$scope.action = function (recent) {

			$ionicActionSheet.show({
				buttons: [
				{ text: 'Email' },
				{ text: 'Send Message' },            
				{ text: 'Group Call' }
				],               
				buttonClicked: function (index) {
					if(index ==0)
						alert('email:' +  recent.group_member_str);
					if(index ==1)
						alert('sms:' +  recent.group_member_str);
					if(index ==2)
						alert('call:' +  recent.group_member_str);

				}
			});
		};


	})


.controller('FriendsCtrl', function ($rootScope,$scope, $stateParams, $filter, $ionicPopover, $ionicModal,$ionicPopup, $ionicModal, Data, $state, $localStorage, $ionicHistory,$ionicActionSheet,$ionicFilterBar) {


	/************ setup data to offfline display*******************/
	if($localStorage.members.length > 0){
			//xem cty dau tien trong ds 
			Data.updateViewData($localStorage.members[0]);
			if($rootScope.company.user!=null)
				for(var i = 0; i < $rootScope.company.user.length; i++) {						
					$rootScope.company.user[i].selected = false;
					
				}
			}
			/********************************************/


			$scope.searchText='';
			$rootScope.showFilterBar = function () {
				filterBarInstance = $ionicFilterBar.show({
					items: $rootScope.contacts,
					update: function (filteredItems, filterText) {
						$scope.items = filteredItems;
				  //if (filterText) {
				  	console.log(filterText);
				  	$scope.searchText = filterText;
				  //}
				}
			});
			};

			$ionicPopover.fromTemplateUrl('templates/company-popover.html', {
				scope: $rootScope,
			}).then(function(popover) {
				$rootScope.popover = popover;
			});




			$scope.selectedChange = function (member)  {	
				member.selected = !member.selected;
				$rootScope.group_member_str ='';
				$rootScope.group_member = [];
				for(var i = 0; i < $rootScope.company.user.length; i++) {						
					if($rootScope.company.user[i].selected && $rootScope.company.user[i].phone_number!=$localStorage.user.phone_number){
						if($rootScope.group_member_str.length == 0)
							$rootScope.group_member_str = $rootScope.company.user[i].name;
						
						else
							$rootScope.group_member_str += ', '+$rootScope.company.user[i].name;	
						
						$rootScope.company.user[i].is_online = false;
						$rootScope.group_member.push($rootScope.company.user[i]);



					}
				}	

			};

			$rootScope.changeCompany = function (company)  {		
				Data.updateViewData(company);
				$scope.popover.hide();

			};

			$rootScope.sendSMSGroup = function ()  {			
			//console.log($rootScope.group_member);
			var numbers='';
			for(var i=0; i < $rootScope.group_member.length; i++)
				if(numbers.length == 0)
					numbers = $rootScope.group_member[i].phone_number;
				else
					numbers += ',' + $rootScope.group_member[i].phone_number;

				Data.sendSMS(numbers);

			//todo add to recents
		};
		
		$rootScope.sendEmailGroup = function ()  {			
			//Data.sendEmail($rootScope.group_member_str);
			var emails = [];
			for(var i=0; i < $rootScope.group_member.length; i++)
				if($rootScope.group_member[i].email != null)
					emails.push($rootScope.group_member[i].email)

				Data.sendEmail(emails);
			//todo add to recents
		};
		
		
		$rootScope.callGroup = function ()  {			
			console.log($rootScope.group_member);
			
			var recent={};
			recent.group_member = $rootScope.group_member;
			recent.group_member_str = $rootScope.group_member_str;
			recent.date = new Date();
			recent.date_frm = $filter('date')( recent.date, 'dd-MM-yyyy');
			
			var me;
			//Them me vao ds
			for(var i = 0; i < $rootScope.company.user.length; i++) {						
				if($rootScope.company.user[i].phone_number == $localStorage.user.phone_number){
					me = $rootScope.company.user[i];
					
				}
			}			
			
			me.is_online = true;			
			recent.group_member.unshift(me);		
			recent.group_member_str = me.name +' ,'+recent.group_member_str;			

			$rootScope.recent = recent;
			$localStorage.recents.splice(0,0,recent);
			
			
			
			$scope.modal.show();
			
			
		};
		
		$scope.action = function (member) {
			if(member.phone_number == $localStorage.user.phone_number){
				$localStorage.user.email = member.email;
				$state.go('tab.account');
			}else{
				$ionicActionSheet.show({
					buttons: [
					{ text: 'Email' },
					{ text: 'Send Message' },            
					{ text: 'Call' },
					{ text: 'Add to Contact' }
					],               
					buttonClicked: function (index) {	

						if(index == 0) {
						// alert('email:' +  member.name);
						Data.sendEmail(member.email);							
						return true;
					}

					if(index == 1) {
						Data.sendSMS(member.phone_number);
						return true;
					}
					if ( index== 2){

						window.plugins.CallNumber.callNumber(null, null, "0912508509", true);
					}
					if(index == 3) {
						
						var contact = {

							"displayName": member.name,

							"phoneNumbers": [
							{
								"value": member.phone_number,
								"type": "mobile"
							}
							],
							"emails": [
							{
								"value": member.email,
								"type": "office"
							}
							],

							"ims": null,
							"organizations": null,
							"birthday": null,
							"note": "",
							"photos": null,
							"categories": null,
							"urls": null
						}
						Data.addToContact(contact);
						

					}


				}
			});
			}
		};	


		$ionicModal.fromTemplateUrl('templates/calling.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal = modal;
		});

		
	})

.controller('AccountCtrl', function ($scope, $state, $ionicActionSheet, $rootScope, $ionicModal, $ionicPopup, $localStorage, Data, $auth) {	
	$scope.historyBack = function () {
            //window.history.back();
            $state.go('tab.friends');
        };

        $scope.choosePhoto = function () {

        	var options = {
        		quality: 75,
        		destinationType: Camera.DestinationType.DATA_URL,
        		sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        		allowEdit: true,
        		encodingType: Camera.EncodingType.JPEG,
        		targetWidth: 150,
        		targetHeight: 150,
        		popoverOptions: CameraPopoverOptions,
        		saveToPhotoAlbum: false
        	};

        	$cordovaCamera.getPicture(options).then(function (imageData) {	
				//to do check network
				var user={};
				user.phone_number = $localStorage.user.phone_number;				
				user.avatar = "data:image/jpeg;base64," + imageData;;
				Data.updateAvatar(user).then(function (data) {
					$localStorage.user.avatar = user.avatar;

				});

			}, function (err) {
			});
        };


        $scope.changeEmail = function () {
        	$ionicPopup.prompt({
        		title: 'Change Email',
				//template: 'Enter someone\'s email to find them on Messenger',
				inputType: 'text',
				inputPlaceholder: 'Email',
				cancelType: 'button-clear',
				okText: 'Save',
				okType: 'button-clear'
			}
			).
        	then(function (res) {
        		alert('Your new email is '+ res);
        		if(res){
						//to do check network
						var user={};
						user.company_id = $rootScope.company.id;
						user.email = res;
						user.phone_number = $localStorage.user.phone_number;
						Data.updateUser(user).then(function (data) {
							$localStorage.user.email = res;

						});
						
					}
				});
        };




        $scope.logout = function () {
        	$localStorage.is_login = false;
        	for (var member in $localStorage)			
        		delete $localStorage[member];

        	$auth.removeToken();
        	$rootScope.is_active_code = null;
        	$state.go('login');


        };

    })

