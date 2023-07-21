// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectID } = require("mongodb");
const mongoose = require("mongoose");


// Create Express app
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Create a schema for the items
const itemsSchema = {
  name: String,
};

// Create a mongoose model based on the schema
const Item = mongoose.model("Item", itemsSchema);

// Default items
const defaultItems = [
  { name: "Welcome to your todoList!" },
  { name: "Hit the + button to add a new item." },
  { name: "<-- Hit this to delete an item." },
];

// Home route
app.get("/", function (req, res) {
  // Find all items in the database
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      // Insert default items if the database is empty
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items inserted successfully.");
        }
        res.redirect("/");
      });
    } else {
      // Render the list template with the found items
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

// Create a new item
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName,
  });
  item.save();
  res.redirect("/");
});

// Delete an item
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;

  MongoClient.connect("mongodb://localhost:27017", function (err, client) {
    if (err) {
      console.log(err);
    } else {
      const db = client.db("todolistDB");
      db.collection("items").deleteOne({ _id: ObjectID(checkedItemId) }, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Item deleted successfully.");
        }
        client.close();
        res.redirect("/");
      });
    }
  });
});


// Start the server
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
