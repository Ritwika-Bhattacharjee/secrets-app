require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json()) 

var loggedinUsername = "";
var searchtag = "";
var searchimageposts = [];
var searchwriteposts = [];

var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 
  
var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
  
var upload = multer({ storage: storage }); 


app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretsuserDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  username: String,
  password: String,
  posts: [String],
  liked: [String],
  disliked: [String],
});

const postSchema = new mongoose.Schema({
	postusername: String,
	caption: String,
	tags: String,
	write: String,
	likes: Number,
	dislikes: Number,
	comments: [{
		user: String,
		info: String
	}],
	image: 
    { 
        data: Buffer, 
        contentType: String 
    } 
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

const Post = new mongoose.model("Post", postSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


app.post("/signup", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/#/signup");
    } else {
      passport.authenticate("local")(req, res, function(){
      	loggedinUsername = req.body.username;
        res.redirect("/getHomePage");
      });
    }
  });

});

app.post("/loginnow", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){

    if (err) {
      console.log(err);
      console.log('login error!');
      res.redirect("/#/login");

    } else {
      passport.authenticate("local")(req, res, function(){
      	loggedinUsername = req.body.username;
      	res.redirect("/getHomePage");
      });
    }
  });


});


app.get("/getImagePostsData", function(req, res){
	var imageposts = [];
	var writeposts = [];
	Post.find(function(err, postsdata){
		if(!err){
			for(var i=0; i<postsdata.length; i++){
				if(postsdata[i].write){
					writeposts.push(postsdata[i]);
				}else{
					imageposts.push(postsdata[i]);
				}  
			}
			res.json(imageposts);
		}else{
			console.log(err);
		}
	});
});

app.get("/getWritePostsData", function(req, res){
	var imageposts = [];
	var writeposts = [];
	Post.find(function(err, postsdata){
		if(!err){
			for(var i=0; i<postsdata.length; i++){
				if(postsdata[i].write){
					writeposts.push(postsdata[i]);
				}else{
					imageposts.push(postsdata[i]);
				}
			}
			res.json(writeposts);
		}else{
			console.log(err);
		}
	});
});

app.get('/getHomePage', function(req, res){
	var imageposts = [];
	var writeposts = [];
	Post.find(function(err, postsdata){
		if(!err){
			for(var i=0; i<postsdata.length; i++){
				if(postsdata[i].write){
					writeposts.push(postsdata[i]);
				}else{
					imageposts.push(postsdata[i]);
				}
			}
			console.log("User logged in is : ", loggedinUsername);
			res.render("userpage-home", {writeposts: writeposts, imageposts: imageposts});
		}else{
			console.log(err);
		}
	});
	
});

app.get('/getMyPostsPage', function(req, res){
	var imageposts = [];
	var writeposts = [];
	Post.find(function(err, postsdata){
		if(!err){
			for(var i=0; i<postsdata.length; i++){
				if(postsdata[i].write){
					writeposts.push(postsdata[i]);
				}else{
					imageposts.push(postsdata[i]);
				}
			}
			console.log("User logged in is : ", loggedinUsername);
			res.render("mypostspage", {writeposts: writeposts, imageposts: imageposts});
		}else{
			console.log(err);
		}
	});
	
});


app.post('/getSearchPage', function(req, res){
	searchimageposts = [];
	searchwriteposts = [];
	searchtag = req.body.query;
	Post.find(function(err, postsdata){
		if(!err){
			for(var i=0; i<postsdata.length; i++){
				if(postsdata[i].write){
					if(postsdata[i].tags.includes(searchtag)){
						searchwriteposts.push(postsdata[i]);
					}
				}else{
					if(postsdata[i].tags.includes(searchtag)){
						searchimageposts.push(postsdata[i]);
					}
				}
			}
			console.log("Inside search get, User logged in is : ", loggedinUsername);
			console.log(searchwriteposts.length);
			console.log(searchimageposts.length);
			res.render("searchpage", {writeposts: searchwriteposts, imageposts: searchimageposts});
			//res.redirect("/searchTagPage");
		}else{
			console.log(err);
		}
	});
});

app.get('/getSearchPostCount', function(req, res){
	var count=0;
	Post.find(function(err, posts){
		if(!err){
			for(var i=0; i<posts.length; i++){
				if(posts[i].tags.includes(searchtag)){
					count = count+1;
				}
			}
			res.json(count);
		}
	});
});

app.get('/getMyPostCount', function(req, res){
	var count=0;
	Post.find(function(err, posts){
		if(!err){
			for(var i=0; i<posts.length; i++){
				if(posts[i].postusername==loggedinUsername){
					count = count+1;
				}
			}
			res.json(count);
		}
	});
});

app.get("/getSearchedImagePostsData", function(req, res){
	var imageposts = [];
	Post.find(function(err, postsdata){
		if(!err){
			for(var i=0; i<postsdata.length; i++){
				if(!postsdata[i].write){
					if(postsdata[i].tags.includes(searchtag)){
						imageposts.push(postsdata[i]);
					}
				}
			}
		}
		res.json(imageposts);
	});
});

app.get("/getSearchedWritePostsData", function(req, res){
	var writeposts = [];
	Post.find(function(err, postsdata){
		if(!err){
			for(var i=0; i<postsdata.length; i++){
				if(postsdata[i].write){
					if(postsdata[i].tags.includes(searchtag)){
						writeposts.push(postsdata[i]);
					}
				}
			}
		}
		res.json(writeposts);
	});
});


app.get("/", function(req, res){
	res.render("welcomepage");
});

app.get("/getusernames", function(req, res){
	User.find(function(err, users){
		if(!err){
			res.json(users);
		}
	});
});

app.post('/postUpload', upload.single('image'), (req, res, next) => { 

if(!req.file){
	var obj = { 
		postusername: loggedinUsername,
		caption: req.body.caption, 
		tags: req.body.tags, 
		write: req.body.secretText,
		likes: 0,
		dislikes: 0
	}
}else{
	var obj = { 
		postusername: loggedinUsername,
		caption: req.body.caption, 
		tags: req.body.tags, 
		write: req.body.secretText,
		likes:0,
		dislikes: 0,
		image: { 
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
			contentType: 'image/png'
		} 
	} 
}
	
	Post.create(obj, (err, item) => { 
		if (err) { 
			console.log(err); 
		} 
		else { 
			// item.save(); 
			res.redirect('/#/userpage/posted'); 
		} 
	}); 
}); 


app.post("/increaseLikes/:postid", function(req, res){
	var newliked = [];
	var newdisliked = [];
	var newlikes = 0;
	var newdislikes =0;
	var postid = req.params.postid;
	User.findOne({username: loggedinUsername}, function(err, user){
		for(var i=0; i<user.disliked.length; i++){
			if(user.disliked[i]!=postid){
				newdisliked.push(user.disliked[i]);
			}
		}
		for(var i=0; i<user.liked.length; i++){
			newliked.push(user.liked[i]);
		}
		newliked.push(postid);
		updateLikeList();


		if(user.disliked.length!=newdisliked.length){
			Post.findOne({_id: postid}, function(err, post){
				newdislikes = post.dislikes-1;
				newlikes = post.likes+1;
				console.log("newlikes: ", newlikes);
				console.log("newdislikes: ", newdislikes);
				updateLikesCount();
				updateDislikesCount();	


			});
			updateDislikeList();
		}else{
			Post.findOne({_id: postid}, function(err, post){
				newlikes = post.likes+1;
				newdislikes = post.dislikes;
				console.log("newlikes: ", newlikes);
				console.log("newdislikes: ", newdislikes);
				updateLikesCount();
				updateDislikesCount();	

			});
		}
		
	});

	updateDislikeList = function(){
		User.updateOne({username: loggedinUsername}, {disliked: newdisliked}, function(err){
				if(err){
					console.log(err);
				}else{
					console.log("successfully updated disliked list!");
				}
			});
	}

	updateLikeList = function(){
		User.updateOne({username: loggedinUsername}, {liked: newliked}, function(err){
				if(err){
					console.log(err);
				}else{
					console.log("successfully updated liked list!");
				}
	});
	}
	
	updateLikesCount = function(){
		Post.updateOne({_id: postid}, {likes: newlikes}, function(err){
			if(err){
				console.log(err);
			}else{
				console.log("successfully updated post likes!");
			}
	});
	}
	
	updateDislikesCount = function(){
		Post.updateOne({_id: postid}, {dislikes: newdislikes}, function(err){
			if(err){
				console.log(err);
			}else{
				console.log("successfully updated post dislikes!");
			}
	});

	}
	
});

app.post("/decreaseLikes/:postid", function(req, res){
	var newliked = [];
	var postid = req.params.postid;
	var newlikes = 0;

	User.findOne({username: loggedinUsername}, function(err, user){
		for(var i=0; i<user.liked.length; i++){
			if(user.liked[i]!=postid){
				newliked.push(user.liked[i]);
			}
		}
		updateLikeList();
	});

	updateLikeList = function(){
		User.findOneAndUpdate({username: loggedinUsername}, {liked: newliked}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log("Removed from liked list successfully!");
		}
	});
	}
	

	Post.findOne({_id: postid}, function(err, post){
		if(!err){
			newlikes = post.likes-1;
			updateLikesCount();
		}
	});

	updateLikesCount = function(){
		Post.findOneAndUpdate({_id: postid},{likes: newlikes}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log("Decreased number of likes successfully!");
		}
	});
	}
	
});


app.post("/increaseDislikes/:postid", function(req, res){
	var newliked = [];
	var newdisliked = [];
	var newlikes = 0;
	var newdislikes =0;
	var postid = req.params.postid;

	User.findOne({username: loggedinUsername}, function(err, user){
		for(var i=0; i<user.liked.length; i++){
			if(user.liked[i]!=postid){
				newliked.push(user.liked[i]);
			}
		}
		for(var i=0; i<user.disliked.length; i++){
			newdisliked.push(user.disliked[i]);
		}
		newdisliked.push(postid);
		updateDislikeList();

		if(user.liked.length!=newliked.length){
			Post.findOne({_id: postid}, function(err, post){
				newlikes = post.likes-1;
				newdislikes = post.dislikes+1;
				updateLikesCount();
				updateDislikesCount();
			});
			updateLikeList();

		}else{
			Post.findOne({_id: postid}, function(err, post){
				newdislikes = post.dislikes+1;
				newlikes = post.likes;
				updateLikesCount();
				updateDislikesCount();
			});
		}

	});

	updateDislikeList = function(){
		User.updateOne({username: loggedinUsername}, {disliked: newdisliked}, function(err){
				if(err){
					console.log(err);
				}else{
					console.log("successfully updated disliked list!");
				}
			});
	}

	updateLikeList = function(){
		User.updateOne({username: loggedinUsername}, {liked: newliked}, function(err){
				if(err){
					console.log(err);
				}else{
					console.log("successfully updated liked list!");
				}
	});
	}
	
	updateLikesCount = function(){
		Post.updateOne({_id: postid}, {likes: newlikes}, function(err){
			if(err){
				console.log(err);
			}else{
				console.log("successfully updated post likes!");
			}
	});
	}
	
	updateDislikesCount = function(){
		Post.updateOne({_id: postid}, {dislikes: newdislikes}, function(err){
			if(err){
				console.log(err);
			}else{
				console.log("successfully updated post dislikes!");
			}
	});

	}
	
	
});


app.post("/decreaseDislikes/:postid", function(req, res){
	var newdisliked = [];
	var postid = req.params.postid;
	var newdislikes = 0;

	User.findOne({username: loggedinUsername}, function(err, user){
		for(var i=0; i<user.disliked.length; i++){
			if(user.disliked[i]!=postid){
				newdisliked.push(user.disliked[i]);
			}
		}
		updateDislikeList();
	});

	updateDislikeList = function(){
		User.findOneAndUpdate({username: loggedinUsername}, {disliked: newdisliked}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log("Removed from disliked list successfully!");
		}
	});
	}
	

	Post.findOne({_id: postid}, function(err, post){
		if(!err){
			newdislikes = post.dislikes-1;
			updateDislikesCount();
		}
	});

	updateDislikesCount = function(){
		Post.findOneAndUpdate({_id: postid},{dislikes: newdislikes}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log("Decreased number of dislikes successfully!");
		}
	});
	}

	
});

app.post("/postcomments/:postid/:mycomment", function(req, res){
	var postid = req.params.postid;
	var commentobj = {
		user: loggedinUsername,
		info: req.params.mycomment
	}
	var newcomments = [];
	Post.findOne({_id: postid}, function(err, post){
		for(var i=0; i<post.comments.length; i++){
			newcomments.push(post.comments[i]);
		}
		newcomments.push(commentobj);
		UpdateCommentsList();
	});

	UpdateCommentsList = function(){
		Post.updateOne({_id: postid}, {comments: newcomments}, function(err){
			if(!err){
				console.log("Successfully Updated Comments List");
				res.json(newcomments);
			}else{
				console.log(err);
			}
		});
	}

});

app.get("/getthisuser", function(req, res){
	User.findOne({username: loggedinUsername}, function(err, user){
		if(!err){
			res.json(user);
		}else{
			console.log(err);
		}
	});
});

app.get("/getAllPosts", function(req, res){
	Post.find(function(err, posts){
		if(!err){
			res.json(posts);
		}else{
			console.log(err);
		}
	});
});

app.get("/logout", function(req, res){
	loggedinUsername = "";
	console.log("Logged out!!");
	res.redirect("/#/");
});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});







