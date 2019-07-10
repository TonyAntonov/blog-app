let express          = require("express"),
    app              = express(),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser")
//   App Configuration    
mongoose.connect("mongodb://localhost/restfull_blog_app", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);    // handle "(node:4823) DeprecationWarning: collection.findAndModify is deprecated." bug
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//   Schema Medel
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//  RESTful Routes 

//  Index Route
app.get("/", function(req, res) {
    res.redirect("/blogs");
});
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogSchema) {
       if(err) {
           console.log("Page not found " + err);
       } else {
           res.render("index", {data: blogSchema});
       }
    });
    
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
});
// CREATE ROUTE
app.post("/blogs", function(req, res){
    // create blog
    //use expressSanitizer package in order to prevent our text aria from user running script tag
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if(err) {
            res.render("new");
        } else {
            // then, redirect to the index
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
 
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
             res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
 //use expressSanitizer package in order to prevent our text aria from user running script tag  
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog) {
        if(err){
            res.rederect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

/*Blog.create({
    title:"My Fintess blog",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
    body: "HEllo this is a test blog post!"
})
*/

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Restful blog app is listening!!!");
})