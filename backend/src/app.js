const express = require("express");
const cors = require("cors");
const charmRoutes = require("./routes/charmRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const braceletRoutes = require("./routes/braceletRoutes");
const orderRoutes = require("./routes/orderRoutes");
const proxyRoutes = require("./routes/proxyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/charms", charmRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bracelets", braceletRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/proxy", proxyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/collections", collectionRoutes);
app.get("/", (req, res) => {
  res.send("Charm Bracelet API is running...");
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
