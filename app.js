// =======dependencies===============
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer'); //used to prevent scripts to run, if users input it in the blog content area 

//==================MongoDB DATABASE CONNECTION============================
mongoose.connect('mongodb://localhost:27017/blog', {useNewUrlParser: true});
//==========APP config==============
//===serving directories
app.set("view engine", "ejs");
app.use(express.static("public"));
//==
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer()); //this has to always go after body-parser
app.use(methodOverride("_method"));

//============Mongoose Schema/Model configuration
const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

let Blog = mongoose.model("Blog", blogSchema);

//===========testing
// Blog.create({
// 	title: "Test Blog",
// 	image: "https://images.unsplash.com/photo-1501908734255-16579c18c25f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=cc2fe6e41a8d9581a5f771bfa3506470&auto=format&fit=crop&w=1700&q=80",
// 	body: "Beautiful views from inside a cave!"
// });

//======================RESTFUL ROUTES====================================
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
			res.render("index", {blogsVar: blogs});
		}
	});
});

//===== NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// ===== CREATE ROUTE
app.post("/blogs", function(req, res){
	//create blog
	// console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// console.log("===========");
	// console.log(req.body);
	let data = req.body.blog
	Blog.create(data, function(err, newBlog){
		if(err){
			res.render("new");
		} else {
			//redirect tot he index
			res.redirect("/blogs");
		}
	});
});

//===== SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blogInfo: foundBlog});
		}
	});
});

//==== EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blogInfo: foundBlog});
		}
	});
});

//===== UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
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
app.delete("/blogs/:id", function(req, res){
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


//=============SERVER==============
app.listen(8080, function(){
	console.log("BlogApp server is running on Port: 8080");
}); 