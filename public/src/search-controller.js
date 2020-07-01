(function(){

	'use strict';

	angular.module("secrets")
	.controller('searchController', searchController)
	.controller('searchPageImageController', searchPageImageController)
	.controller('searchPageWriteController', searchPageImageController)
	.service("searchService", searchService);

	searchController.$inject = ['searchService'];
	function searchController(searchService){

		var searchCtrl = this;

		searchCtrl.query="";

		searchCtrl.findPost = function(){

			searchService.getSearchedTag(searchCtrl.query);
		}


	}

	searchService.$inject = ['$http'];
	function searchService($http){

		var service = this;

		service.getSearchedTag = function(tag){
			$http.get("/getSearchPage/"+tag);
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