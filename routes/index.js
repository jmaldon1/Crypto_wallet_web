const express = require("express");
const walletRoutes = require("./wallet");
const CORS = require("../middleware/cors").CORS;

const constructorMethod = app => {
	app.use("/wallet", CORS, walletRoutes);
	app.use("/", (req, res) => {
    	res.redirect("/wallet");
  	});

  	app.use("*", (req, res) => {
    	res.status(404).json({ error: "Not found" });
  	});
};

module.exports = constructorMethod;