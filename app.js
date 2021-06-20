const { link } = require("fs");

var express   = require("express"),
app           = express(),
bodyParser    = require("body-parser"),
passport      = require("passport"),
LocalStrategy = require("passport-local"),
mongoose      = require("mongoose"),
User          = require("./models/user"),
Recipes       = require("./models/recipes"),
methodOverride= require("method-override")
const dburi= "mongodb+srv://admin:123@cluster0.laosj.mongodb.net/RecipesDatabase?retryWrites=true&w=majority";


mongoose.connect(dburi, {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine", "ejs");
app.get("/",function(reg, res){
    res.render("landing");
});
app.set('port', process.env.PORT || 8080);

app.get("/index", function(req, res){
Recipes.find({},function(err, allrecipes){
    if(err){
        console.log(err);
    }else{
        res.render("index",{recipes:allrecipes});
    }
});
});


app.post("/index", function(req, res){
var name= req.body.name;
var type= req.body.image;
var difficulty= req.body.difficulty;
var ingredients= req.body.ingredients;
var time= req.body.time;
var desc= req.body.desc;
var image= req.body.image;
var author= req.body.author; 
var newRecipe= {name: name, type: type, difficulty: difficulty, ingredients: ingredients, time: time, desc: desc, image: image, author: author}
Recipes.create(newRecipe, function(err, newlyCreated){
    if(err){
        console.log(err);
    }else{
        res.redirect("/index");
    }
});
res.redirect("/index");
});


app.get("/index/new", isLoggedIn, function(req, res){
    res.render("new.ejs");
});

app.get("/index/:id", function(req, res){
    console.log(req.params.id);
    Recipes.findById(req.params.id, function(err, foundRecipe){
if(err)
{
   
    console.log(err);
}else 
res.render("show", {recipes:foundRecipe});
});
});


app.get("/index/:id/edit",IsAdmin, function(req, res){
    Recipes.findById(req.params.id, function(err, foundRecipe){
        if(err)
        {
           res.redirect("/index");
            console.log(err);
        }else {
            res.render("./edit",{recipes: foundRecipe});
    
        }
    });
});


app.put("/index/:id", function(req, res){
    Recipes.findByIdAndUpdate(req.params.id, req.body.recipes, function(err, updatedRecipes){
        if(err){
            res.redirect("/index");
        }else{
            res.redirect("/index/"+req.params.id);
        }
    })
    
});
    


app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
var newUser= new User({username: req.body.username});
User.register(newUser, req.body.password, function(err, user){
    if(err){
        console.log(err);
        return res.render("register");
    }
    passport.authenticate("local")(req, res, function(){
        res.redirect("/index");
    });
});
});

app.get("/login", function(req, res){
    res.render("login");
});

 app.post("/login",passport.authenticate("local", 
 {successRedirect: "/index",
failureRedirect: "/login"
}), function(req, res){
   
 });

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function IsAdmin(req, res, next){
    isLoggedIn();
    if(req.user.id=="60cf53b23116ccd6ec1785c7"){
        return next();
    }
    res.redirect("/index");
}





app.listen(app.get('port'), function(){
    console.log("Przepisy serwer has started");
});