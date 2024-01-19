import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "Sparkey16!",
  port: 5433,
});

db.connect();

let items = [];

app.set('view engine', 'ejs');


app.get("/", async (req, res) => {


  res.render("index.ejs", {
    heading: "Book Note Library",
    
  });
  
});

app.post("/submit", async (req, res) => {

  const title = req.body.title;
  const summary = req.body.summary; 
  const notes = req.body.notes; 

  try {
    await db.query(
      "INSERT INTO book (title, sum, notes) VALUES ($1, $2, $3)",
      [title, summary, notes]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }

});

app.post("/edit", async (req, res) => {


});

app.post("/delete", async (req, res) => {

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.get('/addNotes', (req, res) => {
  res.render('addNotes');
});




