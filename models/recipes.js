var mongoose= require("mongoose");

var recipesSchema= new mongoose.Schema({
    name: String,
    type: String,
    difficulty: String,
    ingredients: String,
    time: String,
    desc: String,
    image: String,
    author: String   
});


module.exports= mongoose.model("Recipes",recipesSchema);