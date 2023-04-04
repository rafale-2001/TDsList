const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('debug', true);


mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name:"Welcome to your to do list"});
const item2 = new Item({name:"Hit the + button to add a new item."});
const item3 = new Item({name:"<--Hit this to delete an item"});
const defaultItems = [item1,item2, item3];





app.get("/", function(req, res) {
  
  

  Item.find({}).then(foundItems=>{
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("Data inserted");
      }).catch(function(error){
          console.log(error);
      });
      res.redirect("/");
    }else{
        res.render("list", {listTitle:"Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  item.save();
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

