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

  

    // try {
    //   const response = await axios.get(`${baseUrl}?q=${encodeURIComponent(bookTitle)}&key=${apiKey}`);
      
    //   // Check if any books were found
    //   if (response.data.totalItems === 0) {
    //     console.log('No books found with the given title.');
    //     return;
    //   }
  
    //   // Get the first book's cover image link
    //   const coverLink = response.data.items[0].volumeInfo.imageLinks.thumbnail;
      
    //   // Use the link to download or render the cover image
    //   console.log(`Book Cover URL: ${coverLink}`);
    //   // Now you can use this URL to download or render the image as needed.

    //   res.render("index.ejs", {
    //     heading: "Book Note Library",
    //     items: items,
    //     cover: coverLink,
    //   });


    // } catch (error) {
    //   console.error('Error fetching book information:', error.message);
    // }

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



async function getBookCover(bookTitle) {
  try {
    const response = await axios.get(`${baseUrl}?q=${encodeURIComponent(bookTitle)}&key=${apiKey}`);
    
    // Check if any books were found
    if (response.data.totalItems === 0) {
      console.log('No books found with the given title.');
      return null; // Return null or any other value to indicate no book found
    }

    // Get the first book's cover image link
    const coverLink = response.data.items[0].volumeInfo.imageLinks.thumbnail;

    // Use the link to download or render the cover image
    console.log(`Book Cover URL: ${coverLink}`);
    // Now you can use this URL to download or render the image as needed.

    // Return the Book Cover URL
    return coverLink;
  } catch (error) {
    console.error('Error fetching book information:', error.message);
    return null; // Return null or any other value to indicate an error
  }
}
