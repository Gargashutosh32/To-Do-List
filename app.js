const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose= require("mongoose");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Ashutosh:Ashutosh_123@cluster0-mv8v5.mongodb.net/ToDoListDb', {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine',"ejs");
var workItems = [];

const itemSchema = {
  name: String
}
const Item =  mongoose.model("Item",itemSchema);

const newListSchema= {
  name:String,
  newListItems: [itemSchema]
}
const List = mongoose.model("List",newListSchema);

const item1 = new Item({
  name:"Welcome to the todolist"
});
const item2 = new Item({
  name: "hit the + button to add an item to the todolist"
});
const item3 = new Item({
  name:"<--hit to delete the existing entries"
});

const defaultItems = [item1,item2,item3];
app.get("/",function(req,res){



 Item.find({},function(err,foundItems){
   if(foundItems.length===0){
     Item.insertMany(defaultItems,function(err){
       if(err){
         console.log(err);
       }else{
         console.log("Success");
       }
     });
     res.redirect("/");

   }else{
     res.render("list",{ListTitle:"Today" , AddedItems:foundItems});
   }

 });


});
app.get("/:customList",function(req,res){
  const customListName = req.params.customList;
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
      const list = new List({
        name:customListName,
        newListItems:defaultItems
      });

      list.save();
      res.redirect("/"+customListName);
      }else{

        res.render("list",{ListTitle:foundList.name,AddedItems:foundList.newListItems});
      }
    }
  });
});


app.post("/",function(req,res){

  const itemName = req.body.Enteritem;
  const ListName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(ListName==="Today"){
    item.save();
    res.redirect("/");

  }
  else{
  List.findOne({name:ListName},function(err,foundList){
    foundList.newListItems.push(item);
    foundList.save();
    res.redirect("/"+ListName);
  });
  }
});
app.post("/delete",function(req,res){
  const itemId = req.body.checkedItem;
  const listNames = req.body.listNames;
if(listNames==="Today"){
  Item.findByIdAndDelete({_id:itemId},function(err){
    if(!err){console.log("Succe deleted");}
  });
  res.redirect("/");
}else{
List.findOneAndUpdate({name:listNames},{$pull:{newListItems:{_id: itemId}}},function(err,foundList){
  if(!err){
    res.redirect("/"+foundList.name);
  }
});

}
});

app.get("/work",function(req,res){
  res.render("list",{ListTitle:"Work",AddedItems:workItems});
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){

  console.log("Server started at port successfully");
});
