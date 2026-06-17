const express = require("express");
const router = express.Router();
const mainLayout = "layouts/main";

router.get(["/", "/home"], (req, res) => {
    const locals = { title: "나의 가계부" };
    res.render("index", { locals, layout: mainLayout });
});

router.get("/about", (req, res) => {
    const locals = { title: "소개" };
    res.render("about", { locals, layout: mainLayout });
});

module.exports = router;
