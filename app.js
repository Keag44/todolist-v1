const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config();

const day = require(__dirname+"/day");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));

const url = "mongodb+srv://Keag44:"+process.env.USER_CLUSTER_PWD+"@cluster0.pkgmdzq.mongodb.net/todolistDB";
mongoose.connect(url);

const itemsSchema = mongoose.Schema({
    name: String
});
const listSchema = mongoose.Schema({
    name:String,
    items:[itemsSchema]
});

const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema);

const item1 = new Item({name:"Item 1"});
const item2 = new Item({name:"Item 2"});
const item3 = new Item({name:"Item 3"});
const defaultItems = [item1,item2,item3];

app.get('/', async (req, res) => {
    try {
        let items = await Item.find(); 
        if(items.length===0){
            console.log("No items in Today");
            items = defaultItems;
            await Item.insertMany(items);
        }
        const title = day.getDate();
        res.render('list',{title: title,items:items})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/add',async(req,res)=>{
    try{
        const newItem = new Item({
        name:req.body.newitem
        });
        const listname = req.body.listName;
        if(listname==day.getDate())
        {
            await newItem.save();
            res.redirect("/");
        }else{
            const foundlist = await List.findOne({name:listname});
            foundlist.items.push(newItem);
            await foundlist.save();
            res.redirect("/lists/"+listname);
        }
    }catch(err){
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
});

app.post("/check",async(req,res)=>{
    try{
        const listname = req.body.listName;
        const itemId = req.body.checkbox;
        if(listname==day.getDate())
        {
            const checkItem = await Item.findByIdAndDelete(itemId);
            res.redirect("/");
        }else{
            const foundlist = await List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemId}}});
            foundlist.save();
            res.redirect("/lists/"+listname);
        }
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }   

})

app.get("/lists/:listname",async(req,res)=>{
    console.log(req.params.listname);
    try{
        const listname = _.capitalize(req.params.listname);
        if(listname!=req.params.listname){
            res.redirect("/lists/"+listname);
        }else{
            const list = await List.findOne({name:listname});
            if(list!=null)
            {
                res.render('list',{title:list.name,items:list.items});
            }
            else {
                console.log("not found");
                const newList = new List({
                    name:listname,
                    items:defaultItems
                });
                await newList.save();
                res.redirect("/lists/"+listname);
            }
        }
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

const port = process.env.PORT||3000;

app.listen(port,function(){
    console.log("Server is running at port "+port)
})