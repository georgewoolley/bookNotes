import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';

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

let itemFormat = [
  { id: 1, title: "Angela Book", sum: "teal book", notes: "lroem ipsum", thumb: "url" },
  { id: 1, title: "George Book", sum: "Red book", notes: "lroem ipsum and much more", thumb: "url2" },
];

app.set('view engine', 'ejs');


app.get("/", async (req, res) => {

  let sortOption = "ASC";

  if (req.query.sort === "desc") {
    sortOption = "DESC";
    console.log("Oldest first");
  }


  try {
    const result = await db.query(`SELECT * FROM book ORDER BY timestamp ${sortOption}`);
  
      const data = result.rows;
      items = data;
    
  
  } catch (err) {
    console.log(err);
  }


  
  try {
    // const coverId = 'ISBN/0385472579'; // Replace with the actual cover identifier
    // const size = 'S'; // Replace with the desired size ('S', 'M', or 'L')

   // const imageUrl = `https://covers.openlibrary.org/b/${coverId}/${size}.jpg`;
    const imageUrl = `https://covers.openlibrary.org/b/isbn/0385472579-S.jpg`;

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    console.log(base64Image);


    res.render("index.ejs", {
      heading: "Book Note Library",
      cover: base64Image,
      items: items,
    });
    
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }




  // res.render("index.ejs", {
  //   heading: "Book Note Library",
  //   cover: base64Image,
  //   items: items,
  // });
  
});



app.post("/submit", async (req, res) => {

  const title = req.body.title;
  const summary = req.body.summary; 
  const notes = req.body.notes; 
  const time = getCurrentTime();

  try {
    await db.query(
      "INSERT INTO book (title, sum, notes, timestamp) VALUES ($1, $2, $3, $4)",
      [title, summary, notes, time]
    );
    console.log(getCurrentTime());
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



function getCurrentTime() {
  const currentDate = new Date();
  
 const isoFormattedDateTime = currentDate.toISOString();
  
 const shortFormattedDateTime = isoFormattedDateTime.slice(0, 19).replace('T', ' ');

  return shortFormattedDateTime;
}
