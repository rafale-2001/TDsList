const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var url = require('url');
const _ = require("lodash");
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

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);


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

app.get("/:customListName",function(req,res){
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName}).then(foundList=>{
    if(foundList){
      // show an existing list
      // console.log(foundList);
      res.render("list",{listTitle:foundList.name ,newListItems : foundList.items})
    }
    else{
      //Create a new list 
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save();
      res.redirect("/"+customListName);
    }
  })
})


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName})
    .then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }

  // item.save();
  // res.redirect("/");
});



app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId)
    .then(()=>{
      console.log("deleted form today");
      res.redirect("/");
    })
    .catch((err)=>{
      console.log(err);
    })
  } 
    else{
      List.findOneAndUpdate({name:listName},{$pull :{items:{_id: checkedItemId}}}).then((foundList)=>{
      res.redirect("/"+listName);
      console.log("deleted");
    }).catch((err)=>{
      console.log(err);
    })
  }

  //the below deleteOne can also be used 
  // Item.deleteOne({_id:checkedItemId})
  // .then(()=>{
  //   console.log("deleted");
  // }).catch((err)=>{
  //   console.log(err);
  // })
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});

