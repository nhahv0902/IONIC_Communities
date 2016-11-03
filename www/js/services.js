
angular.module('starter.services', [])
    .factory('Data', function ($localStorage, $rootScope, $q, $http,  $cordovaSocialSharing, $cordovaSms, $cordovaContacts, $ionicPlatform) {   
		
		var baseUrl= 'http://128.199.145.205:3030/';
		// var baseUrl= 'http://localhost:3030/';
		
		$rootScope.data = $localStorage;
		
        return {
			init: function(){
				self = this;
				if($localStorage.user == null)
					$localStorage.user = {};			
				

				if($localStorage.members == null)
						$localStorage.members = [];

				if($localStorage.recents == null)
						$localStorage.recents = [];
				if($localStorage.avatars == null)
						$localStorage.avatars = {};
					
					
			},
			updateViewData: function(company){
				
				$rootScope.contacts = {};
				$rootScope.company = company;									
	
				for(var i = 0; i < $rootScope.company.user.length; i++) {
					var member = $rootScope.company.user[i];
					if(!member.avatar){
							member.avatar='img/user.png';
					}else{
						//read from cache
						if($localStorage.avatars[member.avatar])
							member.avatar = $localStorage.avatars[member.avatar];
					
					}
					
					
					
					var group = member.group;
					
					if(!$rootScope.contacts[group]) $rootScope.contacts[group] = [];

					//$rootScope.company.user[i].selected = true;	
					$rootScope.contacts[group].push (member);
					
					//update email
					if(member.phone_number == $localStorage.user.phone_number)
						$localStorage.user.email = member.email;		
					
				}
				//if($rootScope.isGroupMaking==false)
					//$rootScope.title = $rootScope.company.name;
				
			},
			
			getMembers: function(phone_number){
				var self = this;
				return $q.when($http.get(baseUrl + 'get_users_by_phone_number?phone_number=' + phone_number )).then(function(response){
						$localStorage.members = [];						
						var links =[];
						for(var i=0;i < response.data.length; i++){
						    var company = response.data[i];
							
							for(var j=0; j < company.user.length; j++){
								company.user[j].name_locdau = self.locdau(company.user[j].name);
								
								//if exist in cache
								if(company.user[j].avatar!=null){
									var link = company.user[j].avatar;
									links.push(link);
									if($localStorage.avatars[link]!=null){
										 //company.user[j].avatar = $localStorage.avatars[link];
										 console.log('existing in cache');
									}else if(Object.keys($localStorage.avatars).length < 100){
									     //download image	 
										self.convertToDataURLviaCanvas(link, function (base64Img) {
											$localStorage.avatars[link] = base64Img;
											console.log('add to cache');
										});
									}
								}
							}
							
							
							$localStorage.members.push(response.data[i]);
							
							
						}
						
						//remove not existing link from avatar cache
						for(var link in $localStorage.avatars){
							var idx = links.indexOf(link);
							if(idx == -1){
								delete $localStorage.avatars[link];
								console.log('remove from cache');
							}
						}
							
						
						return $localStorage.members;
						
						
						
						
					});
			},
			getProfile: function(phone_number){
			 return $q.when($http.get(baseUrl + 'get_profile_by_phone_number?phone_number=' + phone_number )).then(function(response){
						$localStorage.user = response.data[0];						
						if(!$localStorage.user.avatar)
								$localStorage.user.avatar='img/user.png';
						return $localStorage.user;						
						
					});
			},
			updateUser: function(user){
			 return $q.when($http.post(baseUrl + 'update_user',user)).then(function(response){
						
						return response;						
						
					});
			},
			updateAvatar: function(user){
			 return $q.when($http.post(baseUrl + 'update_avatar',user)).then(function(response){
						
						return response;						
						
					});
			},
			
			locdau: function(str) {				
				str= str.toLowerCase();
				str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
				str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
				str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
				str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
				str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
				str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
				str= str.replace(/đ/g,"d");
				str= str.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g,"-");
				str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-
				str= str.replace(/^\-+|\-+$/g,"");//cắt bỏ ký tự - ở đầu và cuối chuỗi

				return str;
			},
			
			convertToDataURLviaCanvas: function(url, callback, outputFormat){
				var img = new Image();
				img.crossOrigin = 'Anonymous';
				img.onload = function(){
					var canvas = document.createElement('CANVAS');
					var ctx = canvas.getContext('2d');
					var dataURL;
					canvas.height = this.height;
					canvas.width = this.width;
					ctx.drawImage(this, 0, 0);
					dataURL = canvas.toDataURL(outputFormat);
					callback(dataURL);
					canvas = null;
				};
				img.src = url;
			},
			
			sendSMS: function(phone_number){
					$cordovaSocialSharing
								.shareViaSMS("", phone_number)
								.then(function (result) {
									// Success!
									return true;

								}, function (err) {
									// An error occurred. Show a message to the user
									return true;
					});
			},
			sendEmail: function(address){
					$cordovaSocialSharing
								.shareViaEmail("", "", address, null, null, null)
								.then(function (result) {
									// Success!
									return true;

								}, function (err) {
									// An error occurred. Show a message to the user
									return true;
								});
			},
			
			addToContact: function(contact){
					$cordovaContacts.save(contact)
							.then(function (result) {
								// Contact saved
								alert('da luu contact');

							}, function (err) {
								// Contact error
					});
			},
			
			
			
			
			
           
        };
    })

