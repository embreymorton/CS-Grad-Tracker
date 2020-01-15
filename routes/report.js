// /routes/report.js
var express = require("express");
var router = express.Router();
var util = require("../controllers/util");

var report = require("../controllers/ReportsController.js");

router.use(function(req, res, next){
	if(process.env.accessLevel == 3){
		res.locals.admin = true;
		next();
	}
	else{
		res.locals.admin = false;
		res.render("../views/error.ejs", {string: "Not admin"});
	}
});

router.get("/", report.get);

module.exports = router;