const express=require("express");
const mongoose=require('mongoose');
const _=require('lodash');
const app=express();
app.set('view engine', 'ejs');// create a views directory and save ejs files there
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
//replace the password below to connect to mongoDB atlas
mongoose.connect("mongodb://admin-aniket:</password>@ac-fq34iy8-shard-00-00.15iv1kl.mongodb.net:27017,ac-fq34iy8-shard-00-01.15iv1kl.mongodb.net:27017,ac-fq34iy8-shard-00-02.15iv1kl.mongodb.net:27017/?ssl=true&replicaSet=atlas-pauzj0-shard-0&authSource=admin&retryWrites=true&w=majority").then(()=>{
    console.log("connected with mongoose")
}).catch((e)=>{
    console.log(e);
});

const itemsSchema={
    name:String
};
const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
    name: "Get up and work hard!"
});
const item2=new Item({
    name: "Don't give up!"
});
const defaultItem=[item1,item2];

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List= mongoose.model("List",listSchema);


let workitems=[];
app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(defaultItem.length===0){
            Item.insertMany(defaultItem,function(err){
                if(err)console.log(err);
                else console.log("Successful insertion of default items");
            })
            res.redirect("/");
        }
        else
        res.render("list",{listTitle: "Today",newListItems:foundItems});
    });
});
app.post("/",function(req,res){
    const itemName=req.body.newitem;
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
});

app.get("/:customListName",function(req,res){
    const ListName=_.capitalize(req.params.customListName);

    List.findOne({name:ListName},function(err,foundList){
        if(!err){
            if(!foundList){
                //If the list with this name does not exist, create one
                const list=new List({
                    name:ListName,
                    items:defaultItem
                });
                list.save();
                res.redirect("/"+ListName);
            }
            else{
                //Show existing list
                res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
            }
        }
    })

})
app.post("/delete",function(req,res){
    const itemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(itemId,function(err){
            if(!err)console.log("successfully removed the item");
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
            if(!err){
                console.log(listName);
                res.redirect("/"+listName);
            }
        })
    }
});

app.listen(3000,function(req,res){
    console.log("Started");
});