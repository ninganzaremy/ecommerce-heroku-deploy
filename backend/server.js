import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import config from "./config";
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import orderRoute from "./routes/orderRoute";

dotenv.config();
const mongodbUrl = config.MONGODB_URL;
mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((error) => console.log(error.reason));

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});
app.use(bodyParser.json());

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.get("/api/config/paypal", (req, res) => {
  res.send(config.PAYPAL_CLIENT_ID);
});

const uploads = path.join(__dirname, '/../uploads');
app.use('/uploads', express.static(uploads));

app.use(express.static(path.join(__dirname, '/../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/build/index.html`));
});

app.use((err, req, res, next) => {
  const status = err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status);
  res.send({ message: err.message });
});

app.use(fileUpload());
app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  const { image } = req.files;
  const filename = `${new Date().getTime()}.jpg`;
  image.mv(`${uploads}/${filename}`, (err) => {
    if (err) return res.status(500).send(err);
    res.send(`/uploads/${filename}`);
  });
});

app.listen(port, () => console.log(`Server serves at http://localhost:${port}`));
