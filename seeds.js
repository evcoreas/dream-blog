var mongoose = require('mongoose');
var Blog = require('./models/blog');
var Comment = require('./models/comment');

var data = [
	{ 
	  title: "Sun Rise",
	  image: "https://images.unsplash.com/photo-1536733916114-bf086d52b9db?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=34ec0fb601835702a6076b73ed9dd299&auto=format&fit=crop&w=1400&q=80",
	  body: "What a beautiful morning! Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
	},
	{ 
	  title: "Star Gaze",
	  image: "https://images.unsplash.com/photo-1536746803623-cef87080bfc8?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=e6627c9716507abba4d778e9ef373f75&auto=format&fit=crop&w=932&q=80",
	  body: "Stare at the stars all night long. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
	 },
	{
	  title: "Bear Mountain",
	  image: "https://images.unsplash.com/photo-1506535995048-638aa1b62b77?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=f3e3ff1cce6d43ff22a50a83269f07ac&auto=format&fit=crop&w=800&q=60",
	  body: "The lake and the views are amazing! Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
	 }
]

function seedDB(){
	//Remove all blogs
	Blog.remove({}, function(err){
		if(err){
			console.log(err);
		}
		console.log("removed all Blogs!");
		Comment.remove({}, function(err) {
			if(err){
				console.log(err);
			}
			console.log("removed comments!");
			//Add a few blogs
			data.forEach(function(seed){
				Blog.create(seed, function(err, blog){
					if(err){
						console.log(err);
					} else {
						console.log("added a Blog");
						//create comment
						Comment.create(
						{
							text: "This pace is great, but I wish there was internet",
							author: "Harry Potter"

						}, function(err, comment){
							if(err){
								console.log(err);
							} else {
								blog.comments.push(comment);
								blog.save();
								console.log("Created a new comment");
							}
						});
					}
				});
			});
		});
	});
}

module.exports = seedDB;