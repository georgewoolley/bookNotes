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
  try {
    await getBookISBN("Sapiens");
    await getBookISBN("Think and Grow Rich");

    let sortOption = "ASC";

    if (req.query.sort === "desc") {
      sortOption = "DESC";
      console.log("Oldest first");
    }

    const result = await db.query(`SELECT * FROM book ORDER BY timestamp ${sortOption}`);
    const data = result.rows;
    items = data;

    for (const i in data) {
      console.log(data[i].thumb);
    }
  } catch (err) {
    console.log(err);
  }

  res.render("index.ejs", {
    heading: "Book Note Library",
    items: items,
  });
});




app.post("/submit", async (req, res) => {

  const title = req.body.title;
  const summary = req.body.summary; 
  const notes = req.body.notes; 
  const time = getCurrentTime();

  let isbn = getBookISBN(title);
  let imageToUpload = getImage(isbn, "s");


  try {
    await db.query(
      "INSERT INTO book (title, sum, notes, timestamp, thumb) VALUES ($1, $2, $3, $4, $5 )",
      [title, summary, notes, time, imageToUpload]
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


function getBookISBN(book) {
  const bookName = book;
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookName)}`;

  return axios.get(apiUrl)
    .then(response => {
      const bookData = response.data.items[0];
      const exists = false;

      if (bookData) {
        const isbn = bookData.volumeInfo.industryIdentifiers.find(identifier => identifier.type === 'ISBN_13');
        console.log('ISBN:', isbn ? isbn.identifier : 'Not found');
        return isbn;
      } else {
        console.log('Book not found');
      }
    })
    .catch(error => {
      console.error('Error fetching book data:', error);
      throw error; // Propagate the error to the caller
    });
}

async function getImage(num, s) {
  try {
    const coverId = num;
    const size = s;

    const imageUrl = `https://covers.openlibrary.org/b/${coverId}/${size}.jpg`;

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');

    return base64Image;
  } catch (err) {
    console.error(err);
    throw err; // Propagate the error to the caller
  }
}
