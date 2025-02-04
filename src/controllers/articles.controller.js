import { Articles } from "../models/articles.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createShow = asyncHandler(async(req, res) => {
    res.render("CreateAtricle",{
    title:"New Article",
    article: new Articles(),
    });
});

const createArticle = asyncHandler(async (req, res) => {
    
});

const updateShow = asyncHandler(async (req, res) => {
    
});

const updateArticle = asyncHandler(async (req, res) => {
    
});

const deleteArticle = asyncHandler(async (req, res) => {
    
});



