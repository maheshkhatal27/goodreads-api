const express = require("express");
const { open } = require("sqlite"); //database related -get,all,run etc
const sqlite3 = require("sqlite3"); //it providers driver
const path = require("path");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "goodreads.db");
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    //we have added app.listen because we want it to run only when db conn. successful
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

//to initialize db and to start server

initializeDbAndServer();
//API to get Books

app.get("/books/", async (request, response) => {
  const getBooksQuery = `SELECT * FROM book
        ORDER BY book_id;`;
  //Now we have to execute this query on database(on db)
  //db.all() gives us promise object hence await-async
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//API to get a book

app.get("/books/:bookId/", async (request, response) => {
  //we need bookId which is in request.params
  const { bookId } = request.params;
  const getBookQuery = `
    SELECT * FROM book WHERE book_id=${bookId};`;
  let book = await db.get(getBookQuery);
  response.send(book);
});

//API to Add a Book

app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  //console.log(dbResponse);
  //sending response as json object

  //when a book is added bookId is there in response
  response.send({ bookId: bookId });
});

//API to update book
//response sending--book updated successfully

app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price=${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

//API to delete a book

app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
      book
    WHERE
      book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully");
});

app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  console.log(request);
  const getAuthorBooksQuery = `
    SELECT
     *
    FROM
     book
    WHERE
      author_id = ${authorId};`;
  const booksArray = await db.all(getAuthorBooksQuery);
  response.send(booksArray);
});
