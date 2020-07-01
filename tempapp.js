var express = require('express') 
var app = express() 
var bodyParser = require('body-parser'); 
var mongoose = require('mongoose') 
  
var fs = require('fs'); 
var path = require('path'); 
require('dotenv/config'); 

/*mongoose.connect(process.env.MONGO_URL, 
    { useNewUrlParser: true, useUnifiedTopology: true }, err => { 
        console.log('connected') 
    }); */

mongoose.connect("mongodb://localhost:27017/photoDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json()) 

// Set EJS as templating engine 
app.set("view engine", "ejs"); 

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

var imgModel = require('./model'); 

// Retriving the image 
app.get('/', (req, res) => { 
	imgModel.find({}, (err, items) => { 
		if (err) { 
			console.log(err); 
		} 
		else { 
			res.render('mainpage', { items: items }); 
		} 
	}); 
}); 

// Uploading the image 
app.post('/', upload.single('image'), (req, res, next) => { 

	var obj = { 
		name: req.body.name, 
		desc: req.body.desc, 
		img: { 
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
			contentType: 'image/png'
		} 
	} 
	imgModel.create(obj, (err, item) => { 
		if (err) { 
			console.log(err); 
		} 
		else { 
			// item.save(); 
			res.redirect('/'); 
		} 
	}); 
}); 

app.listen('3000', err => { 
	if (err) 
		throw err 
	console.log('Server started');
}) 

<div id="post-pic" ng-if="homeCtrl.showimage[<%=index%>]">
		<img src="data:image/<%=post.image.contentType%>;base64,<%=post.image.data.toString('base64')%>"> 
		</div>