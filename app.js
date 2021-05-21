const express=require("express");
const dotenv = require("dotenv");
const mongoose=require("mongoose");
const path=require('path');
dotenv.config();

const app = express();
app.set("view engine","ejs");

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'/public')));

const dbUrl = process.env.MONGO_URL
// mongoose.connect(dbUrl,{useNewUrlParser:true,useUnifiedTopology: true});
// mongoose.set("useFindAndModify", false);
 mongoose.connect("mongodb+srv://SAHIL:SAHIL@sraoz.xwwsb.mongodb.net/bank_management_system?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true});
 mongoose.set('useCreateIndex', true); //deprication in mongoose
const connection = mongoose.connection

connection.once('open', () => {
  console.log('Established')
})


var customerSchema=new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	email:{
		type:String,
		required:true
	},
	Amount:{
		type:Number,
		required:true
	}

});

var Customer = mongoose.model("Customer",customerSchema);

const transactionSchema = mongoose.Schema({
    sendername:{
        type:String,
        required:true
    },
    receivername:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    }
});

const Transaction = mongoose.model("Transaction",transactionSchema);




app.get("/",function(req,res){
    res.render("home");
});

app.get("/transferhistory",function(req,res){
Transaction.find({},function(err,transfers){

          res.render("transferhistory",{
              transferList:transfers
          });
    });
	
});

app.get("/customers",function(req,res){
	Customer.find({},function(err,customers){
        if(customers.length === 0){
            Customer.insertMany(defaultItems,function(err){
            if(err)
            {
                console.log(err);
            }
            else console.log("Customers added Successfully ");
        });
            res.redirect("/customers");
        }
        else{
            res.render("customers",{
                customersList:customers
            });
        }  
		
		
	});
       	
});

app.get("/customers/:customerId",function(req,res){
	const id=req.params.customerId;
	Customer.findOne({_id:id},(err,doc)=>{
		res.render("customer",{customer:doc});
	});
});

app.get("/transfer/:customerId",function(req,res){
    const id=req.params.customerId;
	Customer.findOne({_id:id},(err,doc)=>{
        Customer.find({},(err,result)=>{
            res.render("transfer",{
                customer:doc,
                customers: result
            
            });
        })
		
	});

	
	
});
app.post("/transfer",async (req , res) =>{
    console.log(req.body);
    try{
      myAccount = req.body.senderId;
      clientAccount = req.body.receiverId;
      transferBal = req.body.amount;
      const transferBalAmt = parseInt(transferBal);
      const firstUser = await Customer.findOne({name: myAccount});
      console.log(firstUser);
      const secondUser = await Customer.findOne({name: clientAccount});
      const thirdOne =  parseInt(secondUser.Amount) + parseInt(transferBal); //Updating Successfully
      const fourthOne = parseInt(firstUser.Amount) - parseInt(transferBal);
      console.log(thirdOne);
      console.log(fourthOne);
      await Customer.findOneAndUpdate( {name : clientAccount} , {Amount : thirdOne});
      await Customer.findOneAndUpdate( {name : myAccount} , {Amount : fourthOne});

      await Transaction.create({sendername:firstUser.name,amount:transferBalAmt,receivername:secondUser.name});
     res.redirect("/transferhistory");
    }
    catch (error) {
        res.status(404).send(error);
     }
     
});

app.listen(process.env.PORT || 4000,(err)=>{
	console.log("server is running");
});