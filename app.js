// =======dependencies===============
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
//== Authentication
var passport = require('passport');
var LocalStrategy = require('passport-local');
var Blog = require('./models/blog');
var Comment = require("./models/comment");
var User = require("./models/user");
// var seedDB = require('./seeds');

var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer'); //used to prevent scripts to run, if users input it in the blog content area 
var PORT = process.env.PORT || 5000;

// seedDB();
// deleteDB();

//==================MongoDB DATABASE CONNECTION============================
var uri = 'mongodb://heroku_l3mxsv2g:1ljtl0eco91v4aeavf3qh6g0rs@ds119652.mlab.com:19652/heroku_l3mxsv2g';

mongoose.connect(uri, { useNewUrlParser: true });

//==========APP config==============
app.use(bodyParser.urlencoded({extended:true}));
//===serving directories
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//==

//Passport configuration
app.use(require("express-session")({
	secret: "I love purple!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(expressSanitizer()); //this has to always go after body-parser
app.use(methodOverride("_method"));

//==middleware for currentUser to work on every route
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

// //======================RESTFUL ROUTES====================================
app.get("/", function(req, res){
	// res.send("This is the blog page!");
	res.redirect("/blogs");
});

//===== INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("blogs/index", {blogsVar: blogs});
		}
	});
});

//===== NEW ROUTE
app.get("/blogs/new", isLoggedIn, function(req, res){
	res.render("blogs/new");
});

// ===== CREATE ROUTE
app.post("/blogs", isLoggedIn, function(req, res){
	//create blog
	// console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// console.log("===========");
	// console.log(req.body);
	let data = req.body.blog
	Blog.create(data, function(err, newBlog){
		if(err){
			res.render("blogs/new");
		} else {
			//redirect tot he index
			res.redirect("/blogs");
		}
	});
});

//===== SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
		if(err){
			console.log(err);
		} else {
			res.render("blogs/show", {blogInfo: foundBlog});
		}
	});
});

//==== EDIT ROUTE
app.get("/blogs/:id/edit", isLoggedIn, function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("blogs/edit", {blogInfo: foundBlog});
		}
	});
});

//===== UPDATE ROUTE
app.put("/blogs/:id", isLoggedIn, function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	let id = req.params.id;
	Blog.findByIdAndUpdate(id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + id);
		}
	});
});

//===== DELETE ROUTE
app.delete("/blogs/:id", isLoggedIn, function(req, res){
	// res.send("the delete route!"); to test
	//delete the blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			//redirect somewhere
			res.redirect("/blogs");
		}
	});
});


//=== New COMMENTS
app.get("/blogs/:id/comments/new", isLoggedIn, function(req, res){
	// res.send("This will be the comment form!");
	// find blog by id
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {blogComt: blog});
		}
	});
});


//==Create route
app.post("/blogs/:id/comments", isLoggedIn, function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		} else{
			// console.log(req.body.comment); to see whats on the comment object
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {

					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					console.log("New comment's username will be:" + req.user.username);
					//save comment
					comment.save();
					blog.comments.push(comment);
					blog.save();
					console.log(comment);
					res.redirect("/blogs/" + blog._id);
				}
			})
		}
	})
});


// //===============Auth ROUTES for users
// //===Show Register Form
app.get("/register", function(req, res){
	res.render("register");
});
//handle register sign up logic
app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	console.log("This is the username:" + newUser);
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register")
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/blogs");
		});
	});
});

//===Show Login Form
app.get("/login", function(req, res){
	res.render("login");
});
//handle login logic
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/blogs",
		failureRedirect: "/login"
	}), function(req, res){
	// res.send("loggedIN!"); do this line to test first
});

//===Logout Route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/blogs");
});

//====Middleware for user is logged in
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

//====== To delete all the blogs and comments
// function deleteDB(){
// 	//Remove all blogs
// 	Blog.remove({}, function(err){
// 		if(err){
// 			console.log(err);
// 		}
// 		console.log("removed all blogs!");
// 		Comment.remove({}, function(err) {
// 			if(err){
// 				console.log(err);
// 			}
// 			console.log("removed comments!");
// 		});
// 	});
// };


//=============SERVER==============
app.listen(PORT, function() {console.log("Listening on: " + PORT )});