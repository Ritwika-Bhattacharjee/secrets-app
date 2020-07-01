
(function(){
	'use strict';

	angular.module('secrets')
	.controller('signUpController', signUpController)
	.controller('uploadController', uploadController)
	.controller('homePageController', homePageController)
	.controller('homePageWriteController', homePageWriteController)
	.service("findPostsService", findPostsService)
	.service("signUpService", signUpService)
	.controller('searchController', searchController)
	.controller('searchPageImageController', searchPageImageController)
	.controller('searchPageWriteController', searchPageWriteController)
	.service("searchService", searchService);


	signUpController.$inject = ['$http', 'signUpService'];
	function signUpController($http, signUpService){
		var signupCtrl = this;
		var existing ={};
		signupCtrl.error=false;
		signUpService.getExistingUsers().then(function(response){
			existing = response;
		});
		
		signupCtrl.checkExisting = function(){
			for(var i=0; i<existing.length; i++){
				if(existing[i].username===signupCtrl.username){
					signupCtrl.error=true;
				}else{
					signupCtrl.error=false;
				}
			}
		}

	}

	function uploadController(){
		var uploadCtrl = this;
		uploadCtrl.op1=true;
		uploadCtrl.op2=false;
		uploadCtrl.secretinfo - "";
		uploadCtrl.preview=false;
		document.getElementById("op1").style.backgroundColor="#DEB916";

		uploadCtrl.loadPreview = function(){
			uploadCtrl.preview=true;
		}

		uploadCtrl.activateOp1 = function(){
			document.getElementById("op1").style.backgroundColor="#DEB916";
			document.getElementById("op2").style.backgroundColor="white";

			uploadCtrl.op1 = true;
			uploadCtrl.op2 = false;
		}

		uploadCtrl.activateOp2 = function(){
			document.getElementById("op2").style.backgroundColor="#DEB916";
			document.getElementById("op1").style.backgroundColor="white";

			uploadCtrl.op2 = true;
			uploadCtrl.op1 = false;
		}
	}

	//homepage image controller code

	homePageController.$inject = ['findPostsService'];
	function homePageController(findPostsService){
		var homeCtrl = this;
		homeCtrl.allimageposts = {};
		homeCtrl.imagelikes = [];
		homeCtrl.imagedislikes = [];
		homeCtrl.showcomments = [];
		homeCtrl.imageLikesCount = [];
		homeCtrl.imageDislikesCount = [];
		homeCtrl.imageComments = [];
		homeCtrl.showImagePost = [];
		homeCtrl.showMyImagePost = [];
		homeCtrl.myPostError = false;

		findPostsService.getMyPostCount().then(function(response){
			console.log(response);
			if(response==0){
				homeCtrl.myPostError = true;
			}
		});

		findPostsService.getAllImagePosts().then(function(response){
			homeCtrl.allimageposts = response;
			console.log(homeCtrl.allimageposts);

			for(var i=0; i<homeCtrl.allimageposts.length; i++){
				homeCtrl.imagelikes[i] = false;
				homeCtrl.imagedislikes[i] = false;
				homeCtrl.showcomments[i] = false;
				homeCtrl.showImagePost[i] = true;
				homeCtrl.showMyImagePost[i] = false;
				homeCtrl.imageLikesCount[i]= homeCtrl.allimageposts[i].likes;
				homeCtrl.imageDislikesCount[i]= homeCtrl.allimageposts[i].dislikes;
				homeCtrl.imageComments[i] = homeCtrl.allimageposts[i].comments;

			}
			console.log(homeCtrl.imagelikes);
			console.log(homeCtrl.imagedislikes);
			homeCtrl.decideLikesDislikes();
			homeCtrl.decideMyImagePosts();

		});

		homeCtrl.decideMyImagePosts = function(){
			findPostsService.getThisUser().then(function(response){
				var user = response.username;
				for(var i=0; i<homeCtrl.allimageposts.length; i++){
					if(homeCtrl.allimageposts[i].postusername == user){
						homeCtrl.showMyImagePost[i]=true;
					}
				}
			});
		}

		homeCtrl.decideLikesDislikes = function(){
			findPostsService.getThisUser().then(function(response){
			for(var i=0; i<homeCtrl.allimageposts.length; i++){
				for(var j=0; j<response.liked.length; j++){
					if(homeCtrl.allimageposts[i]._id == response.liked[j]){
						homeCtrl.imagelikes[i] = true;
						homeCtrl.showImagePost[i] = false;
					}
				}
				for(var j=0; j<response.disliked.length; j++){
					if(homeCtrl.allimageposts[i]._id == response.disliked[j]){
						homeCtrl.imagedislikes[i] = true;
						homeCtrl.showImagePost[i] = false;
					}
				}
			}
		});

		}
		
		homeCtrl.imagelike = function(index){
			homeCtrl.imageLikesCount[index] = homeCtrl.imageLikesCount[index] +1;
			if(homeCtrl.imagedislikes[index]){
				homeCtrl.imageDislikesCount[index] = homeCtrl.imageDislikesCount[index]-1;
			}

			homeCtrl.imagelikes[index]=true;
			homeCtrl.imagedislikes[index]= false;
			findPostsService.increaseLikes(homeCtrl.allimageposts[index]._id);
		}
		homeCtrl.notimagelike = function(index){
			homeCtrl.imageLikesCount[index] = homeCtrl.imageLikesCount[index] -1;

			homeCtrl.imagelikes[index] = false;
			findPostsService.decreaseLikes(homeCtrl.allimageposts[index]._id);
		}
		homeCtrl.imagedislike = function(index){
			homeCtrl.imageDislikesCount[index] = homeCtrl.imageDislikesCount[index] +1;
			if(homeCtrl.imagelikes[index]){
				homeCtrl.imageLikesCount[index] = homeCtrl.imageLikesCount[index]-1;
			}

			homeCtrl.imagedislikes[index]= true;
			homeCtrl.imagelikes[index] = false;
			findPostsService.increaseDislikes(homeCtrl.allimageposts[index]._id);
		}
		homeCtrl.notimagedislike = function(index){
			homeCtrl.imageDislikesCount[index] = homeCtrl.imageDislikesCount[index] -1;

			homeCtrl.imagedislikes[index]= false;
			findPostsService.decreaseDislikes(homeCtrl.allimageposts[index]._id);
		}

		homeCtrl.displaycomments = function(index){
			homeCtrl.showcomments[index] = true;
		}
		homeCtrl.hidecomments = function(index){
			homeCtrl.showcomments[index] = false;
		}

		homeCtrl.updateComments = function(index){
			var postid = homeCtrl.allimageposts[index]._id;
			findPostsService.addcomment(postid, homeCtrl.mycomment).then(function(response){
				homeCtrl.imageComments[index] = response; 
			});
		}

	}


	//homepage write controller code:


	homePageWriteController.$inject = ['findPostsService'];
	function homePageWriteController(findPostsService){
		var writeCtrl = this;
		writeCtrl.allwriteposts = {};
		writeCtrl.writelikes = [];
		writeCtrl.writedislikes = [];
		writeCtrl.showcomments = [];
		writeCtrl.writeLikesCount = [];
		writeCtrl.writeDislikesCount = [];
		writeCtrl.writeComments = [];
		writeCtrl.showwritePost = [];
		writeCtrl.showmywritePost = [];
		
		findPostsService.getAllWritePosts().then(function(response){
			writeCtrl.allwriteposts = response;
			console.log(writeCtrl.allwriteposts);

			for(var i=0; i<writeCtrl.allwriteposts.length; i++){
				writeCtrl.writelikes[i] = false;
				writeCtrl.writedislikes[i] = false;
				writeCtrl.showcomments[i] = false;
				writeCtrl.showwritePost[i] = true;
				writeCtrl.writeLikesCount[i]= writeCtrl.allwriteposts[i].likes;
				writeCtrl.writeDislikesCount[i]= writeCtrl.allwriteposts[i].dislikes;
				writeCtrl.writeComments[i] = writeCtrl.allwriteposts[i].comments;

			}
			console.log(writeCtrl.writelikes);
			console.log(writeCtrl.writedislikes);
			writeCtrl.decideLikesDislikes();
			writeCtrl.decideMyWritePosts();

		});

		writeCtrl.decideMyWritePosts = function(){
			findPostsService.getThisUser().then(function(response){
				var user = response.username;
				for(var i=0; i<writeCtrl.allwriteposts.length; i++){
					if(writeCtrl.allwriteposts[i].postusername == user){
						writeCtrl.showmywritePost[i]=true;
					}
				}
			});
		}


		writeCtrl.decideLikesDislikes = function(){
			findPostsService.getThisUser().then(function(response){
			for(var i=0; i<writeCtrl.allwriteposts.length; i++){
				for(var j=0; j<response.liked.length; j++){
					if(writeCtrl.allwriteposts[i]._id == response.liked[j]){
						writeCtrl.writelikes[i] = true;
						writeCtrl.showwritePost[i] = false;
					}
				}
				for(var j=0; j<response.disliked.length; j++){
					if(writeCtrl.allwriteposts[i]._id == response.disliked[j]){
						writeCtrl.writedislikes[i] = true;
						writeCtrl.showwritePost[i] = false;
					}
				}
			}
		});

		}
		
		writeCtrl.writelike = function(index){
			writeCtrl.writeLikesCount[index] = writeCtrl.writeLikesCount[index] +1;
			if(writeCtrl.writedislikes[index]){
				writeCtrl.writeDislikesCount[index] = writeCtrl.writeDislikesCount[index]-1;
			}

			writeCtrl.writelikes[index]=true;
			writeCtrl.writedislikes[index]= false;
			findPostsService.increaseLikes(writeCtrl.allwriteposts[index]._id);
		}
		writeCtrl.notwritelike = function(index){
			writeCtrl.writeLikesCount[index] = writeCtrl.writeLikesCount[index] -1;

			writeCtrl.writelikes[index] = false;
			findPostsService.decreaseLikes(writeCtrl.allwriteposts[index]._id);
		}
		writeCtrl.writedislike = function(index){
			writeCtrl.writeDislikesCount[index] = writeCtrl.writeDislikesCount[index] +1;
			if(writeCtrl.writelikes[index]){
				writeCtrl.writeLikesCount[index] = writeCtrl.writeLikesCount[index]-1;
			}

			writeCtrl.writedislikes[index]= true;
			writeCtrl.writelikes[index] = false;
			findPostsService.increaseDislikes(writeCtrl.allwriteposts[index]._id);
		}
		writeCtrl.notwritedislike = function(index){
			writeCtrl.writeDislikesCount[index] = writeCtrl.writeDislikesCount[index] -1;

			writeCtrl.writedislikes[index]= false;
			findPostsService.decreaseDislikes(writeCtrl.allwriteposts[index]._id);
		}

		writeCtrl.displaycomments = function(index){
			writeCtrl.showcomments[index] = true;
		}
		writeCtrl.hidecomments = function(index){
			writeCtrl.showcomments[index] = false;
		}

		writeCtrl.updateComments = function(index){
			var postid = writeCtrl.allwriteposts[index]._id;
			findPostsService.addcomment(postid, writeCtrl.mycomment).then(function(response){
				writeCtrl.writeComments[index] = response; 
			});
		}

	}



	findPostsService.$inject = ['$http'];
	function findPostsService($http){
		var service = this;

		service.getAllImagePosts = function(){
			var data = $http.get('/getImagePostsData').then(function(response){
				return response.data;
			});
			return data;

		}

		service.getAllWritePosts = function(){
			var data = $http.get('/getWritePostsData').then(function(response){
				return response.data;
			});
			return data;

		}

		service.increaseLikes = function(id){
			$http.post('/increaseLikes/'+id);
		}
		service.decreaseLikes = function(id){
			$http.post('/decreaseLikes/'+id);
		}
		service.increaseDislikes = function(id){
			$http.post('/increaseDislikes/'+id);
		}
		service.decreaseDislikes = function(id){
			$http.post('/decreaseDislikes/'+id);
		}

		service.addcomment = function(postid, mycomment){
			return $http.post('/postcomments/'+postid + "/"+mycomment).then(function(response){
				return response.data;
			});

		}

		service.getThisUser = function(){
			return $http.get("/getthisuser").then(function(response){
				return response.data;
			});
		}

		service.getSearchedImagePosts = function(){
			var data = $http.get('/getSearchedImagePostsData').then(function(response){
				return response.data;
			});
			return data;
		}

		service.getSearchedWritePosts = function(){
			var data = $http.get('/getSearchedWritePostsData').then(function(response){
				return response.data;
			});
			return data;
		}

		service.getSearchPostCount = function(){
			return $http.get('/getSearchPostCount').then(function(response){
				return response.data;
			});
		}

		service.getMyPostCount = function(){
			return $http.get("/getMyPostCount").then(function(response){
				return response.data;
			});
		}
	}

	signUpService.$inject = ['$http'];
	function signUpService($http){

		var service = this;

		service.getExistingUsers  = function(){
			return $http.get('/getusernames').then(function(response){
				return response.data;
			});
		}
	}



	searchController.$inject = ['searchService'];
	function searchController(searchService){

		var searchCtrl = this;

		searchCtrl.query="";
		searchCtrl.allposts=[];
		searchCtrl.alltags=[];
		searchCtrl.matchedtags=[];

		searchService.getAllPosts().then(function(response){
			searchCtrl.allposts = response;
			for(var i=0; i<searchCtrl.allposts.length; i++){
				var splitstring = searchCtrl.allposts[i].tags.split(' ');
				for(var j=0; j<splitstring.length; j++){
					var x=0;
					for(var k=0; k<searchCtrl.alltags.length; k++){
						if(searchCtrl.alltags[k] == splitstring[j]){
							x=1; 
						}
					}
					if(x==0){
						searchCtrl.alltags.push(splitstring[j]);

					}
				}
			}
			console.log("tags list completed!");
		});

	}

	searchService.$inject = ['$http'];
	function searchService($http){

		var service = this;

		service.getAllPosts = function(){
			return $http.get("/getAllPosts").then(function(response){
				return response.data;
			});
		}
		
	}


	searchPageImageController.$inject = ['findPostsService'];
	function searchPageImageController(findPostsService){
		var spimageCtrl = this;
		spimageCtrl.allimageposts = {};
		spimageCtrl.imagelikes = [];
		spimageCtrl.imagedislikes = [];
		spimageCtrl.showcomments = [];
		spimageCtrl.imageLikesCount = [];
		spimageCtrl.imageDislikesCount = [];
		spimageCtrl.imageComments = [];
		spimageCtrl.showImagePost = [];
		spimageCtrl.searchPostError = false;

		findPostsService.getSearchPostCount().then(function(response){
			console.log(response);
			if(response==0){
				spimageCtrl.searchPostError = true;
			}
		});

		findPostsService.getSearchedImagePosts().then(function(response){
			spimageCtrl.allimageposts = response;
			console.log(spimageCtrl.allimageposts);

			for(var i=0; i<spimageCtrl.allimageposts.length; i++){
				spimageCtrl.imagelikes[i] = false;
				spimageCtrl.imagedislikes[i] = false;
				spimageCtrl.showcomments[i] = false;
				spimageCtrl.showImagePost[i] = true;
				spimageCtrl.imageLikesCount[i]= spimageCtrl.allimageposts[i].likes;
				spimageCtrl.imageDislikesCount[i]= spimageCtrl.allimageposts[i].dislikes;
				spimageCtrl.imageComments[i] = spimageCtrl.allimageposts[i].comments;

			}
			console.log(spimageCtrl.imagelikes);
			console.log(spimageCtrl.imagedislikes);
			spimageCtrl.decideLikesDislikes();

		});


		spimageCtrl.decideLikesDislikes = function(){
			findPostsService.getThisUser().then(function(response){
			for(var i=0; i<spimageCtrl.allimageposts.length; i++){
				for(var j=0; j<response.liked.length; j++){
					if(spimageCtrl.allimageposts[i]._id == response.liked[j]){
						spimageCtrl.imagelikes[i] = true;
					}
				}
				for(var j=0; j<response.disliked.length; j++){
					if(spimageCtrl.allimageposts[i]._id == response.disliked[j]){
						spimageCtrl.imagedislikes[i] = true;
					}
				}
			}
		});

		}
		
		spimageCtrl.imagelike = function(index){
			spimageCtrl.imageLikesCount[index] = spimageCtrl.imageLikesCount[index] +1;
			if(spimageCtrl.imagedislikes[index]){
				spimageCtrl.imageDislikesCount[index] = spimageCtrl.imageDislikesCount[index]-1;
			}

			spimageCtrl.imagelikes[index]=true;
			spimageCtrl.imagedislikes[index]= false;
			findPostsService.increaseLikes(spimageCtrl.allimageposts[index]._id);
		}
		spimageCtrl.notimagelike = function(index){
			spimageCtrl.imageLikesCount[index] = spimageCtrl.imageLikesCount[index] -1;

			spimageCtrl.imagelikes[index] = false;
			findPostsService.decreaseLikes(spimageCtrl.allimageposts[index]._id);
		}
		spimageCtrl.imagedislike = function(index){
			spimageCtrl.imageDislikesCount[index] = spimageCtrl.imageDislikesCount[index] +1;
			if(spimageCtrl.imagelikes[index]){
				spimageCtrl.imageLikesCount[index] = spimageCtrl.imageLikesCount[index]-1;
			}

			spimageCtrl.imagedislikes[index]= true;
			spimageCtrl.imagelikes[index] = false;
			findPostsService.increaseDislikes(spimageCtrl.allimageposts[index]._id);
		}
		spimageCtrl.notimagedislike = function(index){
			spimageCtrl.imageDislikesCount[index] = spimageCtrl.imageDislikesCount[index] -1;

			spimageCtrl.imagedislikes[index]= false;
			findPostsService.decreaseDislikes(spimageCtrl.allimageposts[index]._id);
		}

		spimageCtrl.displaycomments = function(index){
			spimageCtrl.showcomments[index] = true;
		}
		spimageCtrl.hidecomments = function(index){
			spimageCtrl.showcomments[index] = false;
		}

		spimageCtrl.updateComments = function(index){
			var postid = spimageCtrl.allimageposts[index]._id;
			findPostsService.addcomment(postid, spimageCtrl.mycomment).then(function(response){
				spimageCtrl.imageComments[index] = response; 
			});
		}

	}


	//homepage write controller code:


	searchPageWriteController.$inject = ['findPostsService'];
	function searchPageWriteController(findPostsService){
		var spwriteCtrl = this;
		spwriteCtrl.allwriteposts = {};
		spwriteCtrl.writelikes = [];
		spwriteCtrl.writedislikes = [];
		spwriteCtrl.showcomments = [];
		spwriteCtrl.writeLikesCount = [];
		spwriteCtrl.writeDislikesCount = [];
		spwriteCtrl.writeComments = [];
		spwriteCtrl.showwritePost = [];
		
		findPostsService.getSearchedWritePosts().then(function(response){
			spwriteCtrl.allwriteposts = response;
			console.log(spwriteCtrl.allwriteposts);

			for(var i=0; i<spwriteCtrl.allwriteposts.length; i++){
				spwriteCtrl.writelikes[i] = false;
				spwriteCtrl.writedislikes[i] = false;
				spwriteCtrl.showcomments[i] = false;
				spwriteCtrl.showwritePost[i] = true;
				spwriteCtrl.writeLikesCount[i]= spwriteCtrl.allwriteposts[i].likes;
				spwriteCtrl.writeDislikesCount[i]= spwriteCtrl.allwriteposts[i].dislikes;
				spwriteCtrl.writeComments[i] = spwriteCtrl.allwriteposts[i].comments;

			}
			console.log(spwriteCtrl.writelikes);
			console.log(spwriteCtrl.writedislikes);
			spwriteCtrl.decideLikesDislikes();

		});


		spwriteCtrl.decideLikesDislikes = function(){
			findPostsService.getThisUser().then(function(response){
			for(var i=0; i<spwriteCtrl.allwriteposts.length; i++){
				for(var j=0; j<response.liked.length; j++){
					if(spwriteCtrl.allwriteposts[i]._id == response.liked[j]){
						spwriteCtrl.writelikes[i] = true;
					}
				}
				for(var j=0; j<response.disliked.length; j++){
					if(spwriteCtrl.allwriteposts[i]._id == response.disliked[j]){
						spwriteCtrl.writedislikes[i] = true;
					}
				}
			}
		});

		}
		
		spwriteCtrl.writelike = function(index){
			spwriteCtrl.writeLikesCount[index] = spwriteCtrl.writeLikesCount[index] +1;
			if(spwriteCtrl.writedislikes[index]){
				spwriteCtrl.writeDislikesCount[index] = spwriteCtrl.writeDislikesCount[index]-1;
			}

			spwriteCtrl.writelikes[index]=true;
			spwriteCtrl.writedislikes[index]= false;
			findPostsService.increaseLikes(spwriteCtrl.allwriteposts[index]._id);
		}
		spwriteCtrl.notwritelike = function(index){
			spwriteCtrl.writeLikesCount[index] = spwriteCtrl.writeLikesCount[index] -1;

			spwriteCtrl.writelikes[index] = false;
			findPostsService.decreaseLikes(spwriteCtrl.allwriteposts[index]._id);
		}
		spwriteCtrl.writedislike = function(index){
			spwriteCtrl.writeDislikesCount[index] = spwriteCtrl.writeDislikesCount[index] +1;
			if(spwriteCtrl.writelikes[index]){
				spwriteCtrl.writeLikesCount[index] = spwriteCtrl.writeLikesCount[index]-1;
			}

			spwriteCtrl.writedislikes[index]= true;
			spwriteCtrl.writelikes[index] = false;
			findPostsService.increaseDislikes(spwriteCtrl.allwriteposts[index]._id);
		}
		spwriteCtrl.notwritedislike = function(index){
			spwriteCtrl.writeDislikesCount[index] = spwriteCtrl.writeDislikesCount[index] -1;

			spwriteCtrl.writedislikes[index]= false;
			findPostsService.decreaseDislikes(spwriteCtrl.allwriteposts[index]._id);
		}

		spwriteCtrl.displaycomments = function(index){
			spwriteCtrl.showcomments[index] = true;
		}
		spwriteCtrl.hidecomments = function(index){
			spwriteCtrl.showcomments[index] = false;
		}

		spwriteCtrl.updateComments = function(index){
			var postid = spwriteCtrl.allwriteposts[index]._id;
			findPostsService.addcomment(postid, spwriteCtrl.mycomment).then(function(response){
				spwriteCtrl.writeComments[index] = response; 
			});
		}

	}
})();