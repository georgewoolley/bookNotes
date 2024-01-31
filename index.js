import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';

const app = express();
const port = 3000;
const apiKey = "AIzaSyBmnZkL8Iy4ihOQrZaXDYSh19U1FIBj-u4";
const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
//const bookTitle = "Sapiens"

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));


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
  let items = [];

  try {
    let sortOption = "ASC";

    

    if (req.query.sort === "desc") {
      sortOption = "DESC";
      console.log("Oldest first");
    }

    const result = await db.query(`SELECT * FROM book ORDER BY timestamp ${sortOption}`);
    const data = result.rows;
    items = data;
    for (let bookUrls in items) {
      console.log("Book URLS: " + bookUrls.thumb);
    }

    
       res.render("index.ejs", {
        heading: "Book Note Library",
        items: items,
        
      });
   
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }





});




app.post("/submit", async (req, res) => {
  const title = req.body.title;
  const summary = req.body.summary;
  const notes = req.body.notes;
  const time = getCurrentTime();
  const id = req.body.id;

  try {
    const bookCoverUrl = await getBookCover(title);

   await db.query(
      "INSERT INTO book (title, sum, notes, timestamp, thumb) VALUES ($1, $2, $3, $4, $5 )",
      [title, summary, notes, time, bookCoverUrl]
    );

    console.log(getCurrentTime());
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



app.post("/update", async (req, res) => {
  const title = req.body.title;
  const summary = req.body.summary;
  const notes = req.body.notes;
  const time = getCurrentTime();
  const id = req.body.recordId;
  console.log("The updated ID is :" +id);

  try {
    const bookCoverUrl = await getBookCover(title);

    await db.query(
      "UPDATE book SET title = $1, sum = $2, notes = $3, timestamp = $4, thumb = $5 WHERE id = $6",
      [title, summary, notes, time, bookCoverUrl, id]
    );

    console.log(getCurrentTime());
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



app.get('/details', (req, res) => {
  const title = req.query.title;
  const summary = req.query.summary;
  const timestamp = req.query.timestamp;
  const thumb = req.query.thumb;
  const id = req.query.id;

  // Render the details page with the provided data
  res.render('details.ejs', { title, summary, timestamp, thumb, id });
});


app.post('/delete', async (req, res) => {
  const id = req.body.itemId;

  try {
    await db.query("DELETE FROM book WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Error deleting entry' });
  }
});





app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.get('/addNotes', (req, res) => {
  res.render('addNotes');
});


app.get('/edit/:id', async (req, res) => {
  // Assuming 'id' is used to identify the record to edit
  // You can fetch the record from your database using this id
  // Replace sampleRecord with the actual data from your database

  const recordId = req.params.id;
  console.log("Record ID is " + recordId)

  try {
    const result = await db.query('SELECT * FROM book WHERE id = $1', [recordId]);
    const data = result.rows;
  
    if (data && data.length > 0) {
      const id = data[0].id;
      const title = data[0].title;
      const summary = data[0].summary;
      const notes = data[0].notes;
  
      res.render("editForm.ejs", {
        id: id,
        title: title,
        summary: summary,
        notes: notes,
      });
    } else {
      // Handle the case when no matching record is found
      res.status(404).send('Record not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
  


  
});


function getCurrentTime() {
  const currentDate = new Date();
  
 const isoFormattedDateTime = currentDate.toISOString();
  
 const shortFormattedDateTime = isoFormattedDateTime.slice(0, 19).replace('T', ' ');

  return shortFormattedDateTime;
}



async function getBookCover(bookTitle) {
  try {
    const response = await axios.get(`${baseUrl}?q=${encodeURIComponent(bookTitle)}&key=${apiKey}`);
    
   
    if (response.data.totalItems === 0) {
      console.log('No books found with the given title.');
      return null; 
    }

    const coverLink = response.data.items[0].volumeInfo.imageLinks.thumbnail;


    console.log(`Book Cover URL: ${coverLink}`);
   
    return coverLink;
  } catch (error) {
    console.error('Error fetching book information:', error.message);
    return null; 
  }
}
