const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const adminLayout = "layouts/admin";
const adminLayout2 = "layouts/admin-nologout";
const jwtSecret = process.env.JWT_SECRET;

/**
 * 로그인 확인 미들웨어
 */
const checkLogin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/admin");
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.id; // 토큰 생성 시 { id: user._id } 로 저장
        next();
    } catch (error) {
        return res.redirect("/admin");
    }
};

/**
 * GET /admin  - 로그인 페이지
 */
router.get("/admin", (req, res) => {
    const locals = { title: "로그인", error: null };
    res.render("admin/index", { locals, layout: adminLayout2 });
});

/**
 * GET /register  - 회원가입 페이지
 */
router.get("/register", (req, res) => {
    const locals = { title: "회원가입", error: null };
    res.render("admin/register", { locals, layout: adminLayout2 });
});

/**
 * POST /register  - 회원가입
 */
router.post("/register", asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        const locals = { title: "회원가입", error: "아이디와 비밀번호를 입력해 주세요." };
        return res.render("admin/register", { locals, layout: adminLayout2 });
    }
    const exists = await User.findOne({ username });
    if (exists) {
        const locals = { title: "회원가입", error: "이미 사용 중인 아이디입니다." };
        return res.render("admin/register", { locals, layout: adminLayout2 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect("/admin");
}));

/**
 * POST /admin  - 로그인 처리
 */
router.post("/admin", asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        const locals = { title: "로그인", error: "일치하는 사용자가 없습니다." };
        return res.render("admin/index", { locals, layout: adminLayout2 });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        const locals = { title: "로그인", error: "비밀번호가 일치하지 않습니다." };
        return res.render("admin/index", { locals, layout: adminLayout2 });
    }
    const token = jwt.sign({ id: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/allTransactions");
}));

/**
 * GET /allTransactions  - 내역 목록 + 수입/지출/잔액 집계
 */
router.get("/allTransactions", checkLogin, asyncHandler(async (req, res) => {
    const data = await Transaction.find({ user: req.userId }).sort({ date: -1, createdAt: -1 });
    let income = 0;
    let expense = 0;
    data.forEach((t) => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });
    const locals = { title: "가계부 내역" };
    res.render("admin/allTransactions", {
        locals,
        data,
        income,
        expense,
        balance: income - expense,
        layout: adminLayout,
    });
}));

/**
 * GET /transaction/:id  - 내역 상세
 */
router.get("/transaction/:id", checkLogin, asyncHandler(async (req, res) => {
    const data = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!data) {
        return res.redirect("/allTransactions");
    }
    const locals = { title: "내역 상세" };
    res.render("admin/detail", { locals, data, layout: adminLayout });
}));

/**
 * GET /add  - 내역 추가 폼
 */
router.get("/add", checkLogin, (req, res) => {
    const locals = { title: "내역 추가" };
    res.render("admin/add", { locals, layout: adminLayout });
});

/**
 * POST /add  - 내역 추가
 */
router.post("/add", checkLogin, asyncHandler(async (req, res) => {
    const { type, category, amount, memo, date } = req.body;
    await Transaction.create({
        user: req.userId,
        type,
        category,
        amount,
        memo,
        date: date || Date.now(),
    });
    res.redirect("/allTransactions");
}));

/**
 * GET /edit/:id  - 내역 수정 폼
 */
router.get("/edit/:id", checkLogin, asyncHandler(async (req, res) => {
    const data = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    const locals = { title: "내역 수정" };
    res.render("admin/edit", { locals, data, layout: adminLayout });
}));

/**
 * PUT /edit/:id  - 내역 수정
 */
router.put("/edit/:id", checkLogin, asyncHandler(async (req, res) => {
    const { type, category, amount, memo, date } = req.body;
    await Transaction.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { type, category, amount, memo, date },
        { runValidators: true }
    );
    res.redirect("/allTransactions");
}));

/**
 * DELETE /delete/:id  - 내역 삭제
 */
router.delete("/delete/:id", checkLogin, asyncHandler(async (req, res) => {
    await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.redirect("/allTransactions");
}));

/**
 * GET /logout  - 로그아웃
 */
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

module.exports = router;
