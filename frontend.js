#!/usr/bin/env node

const { firstLogin, confirm } = require("./src/auth")
const { gen } = require("./src/gen")
const chalk = require("chalk")
const fs = require("fs")
const path = require("path")
const os = require("os")
const crypto = require("crypto")
const express = require("express")

const BASE_DIR = process.env.RICHPASS_TEST_DIR || path.join(os.homedir(), ".richpass")
const VAULT_PATH = path.join(BASE_DIR, "vault.json")
const ACC_PATH = path.join(BASE_DIR, "acc.json")

const app = express()
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.render("index")
})

app.listen(3000)