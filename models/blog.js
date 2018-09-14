var mongoose = require("mongoose");


//============Mongoose Schema/Model configuration
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now},
	author: {
   		id: {
   			type: mongoose.Schema.Types.ObjectId,
   			ref: "User"
   		},
   		username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Blog", blogSchema);

//===========testing
// Blog.create({
// 	title: "Test Blog",
// 	image: "https://images.unsplash.com/photo-1501908734255-16579c18c25f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=cc2fe6e41a8d9581a5f771bfa3506470&auto=format&fit=crop&w=1700&q=80",
// 	body: "Beautiful views from inside a cave!"
// });

