import app from "./app";

const port = process.env.APP_PORT || 8000;
// init server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
