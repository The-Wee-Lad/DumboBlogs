import mongoose from "mongoose";
import { Articles } from "../models/articles.model.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { JSDOM } from "jsdom";
import createDOMpurify from "dompurify";
import markdownit from 'markdown-it'

const createShow = asyncHandler(async (req, res) => {
    res.render("./Articles/createArticle", {
        title: "New Article",
        article: new Articles(),
    });
});

const createArticle = asyncHandler(async (req, res) => {

    const { formData } = req.body;
    const window = new JSDOM('').window;
    const DOMPurify = createDOMpurify(window);
    let cleanMarkdown = DOMPurify.sanitize(formData.markdown);
    cleanMarkdown = (new markdownit({html:true})).render(cleanMarkdown);
    const article = await Articles.create({
        title: formData.title,
        description: formData.description,
        markdown: cleanMarkdown,
        author: req.user?._id,
        isPublic: formData.isPublic,
    });
    if (!article) {
        res.status(500).json(new ApiResponse(401, {}, "couldn't create new article, try again", 720));
        throw new Error("DB error in article creation");
    }
    res.status(200).json(new ApiResponse(200, article, "Created the Article", 200));

});


const showPublicArticles = asyncHandler(async (req, res) => {
    const articleId = req.params.id;
    console.log("ID : ", articleId);
    if (!mongoose.isValidObjectId(articleId)) {
        res.redirect("/");
        throw new Error("Invalid ID");
    }
    const article = (await Articles.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(articleId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $project: {
                            refreshToken: 0,
                            role: 0,
                            password: 0,
                            email: 0
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$author"
        }
    ]))[0];

    if (!article || !(article?.isPublic)) {
        res.status(400 + !(article?.isPublic)).redirect("/");
        throw new Error("No Such article Found or Private Article" + 400 + !(article?.isPublic));
    }

    res.status(200)
        // .set("Cache-Control","no-store, no-cache, must-revalidate, private")
        .render("./Articles/showArticle", {
            title: "Article",
            article: article,
        });
});

const showPrivateArticles = asyncHandler(async (req, res) => {
    const user = req.user;
    const articleId = req.params.id;
    console.log("ID : ", articleId);
    console.log("User: ", user);

    res.status(200)
        .set("Cache-Control", "no-store, no-cache, must-revalidate, private")
        .render("./Articles/showPrivateArticle", {
            title: "Private Article",
            article: new Articles(),
        });

});

const updateShow = asyncHandler(async (req, res) => {
    res.render("./Articles/updateArticle", {
        title: "Update Article",
        article: new Articles(),
    });
});

const getArticle = asyncHandler(async (req, res) => {
    console.log("getting article");

    const user = req.user;
    const articleId = req.params.id;
    console.log("ID : ", articleId);
    console.log("User: ", user);


    if (!mongoose.isValidObjectId(articleId)) {
        res.status(400).json(new ApiResponse(400, {}, "Invalid_Id", 720));
        throw new Error("Invalid Article ID [Private route]");
    }
    const article = (await Articles.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(articleId),
                author: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $project: {
                            refreshToken: 0,
                            role: 0,
                            password: 0,
                            email: 0
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$author"
        }
    ]))[0];
    console.log("isPublic", article?.isPublic);
    if (!article) {
        res.status(400 + !(article?.author?._id == req?.user?._id)).json(new ApiResponse(400, {}, "No such Article Found", 720));
        throw new Error("No Such article Found or Private Article" + 400 + !(article?.isPublic));
    }

    res.status(200).json(new ApiResponse(200, article, "Article Fetched", 200));
});

const updateArticle = asyncHandler(async (req, res) => {

    const articleId = req?.params?.id;
    const { formData } = req.body;
    // console.log("To update : ", req.body);
    const window = new JSDOM('').window;
    const DOMPurify = createDOMpurify(window);
    let cleanMarkdown = DOMPurify.sanitize(formData.markdown);
    cleanMarkdown = (new markdownit({html:true})).render(cleanMarkdown);
    const article = await Articles.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(articleId),
            author: new mongoose.Types.ObjectId(req?.user?._id)
        }
        , [
            {
                $set: {
                    title: formData.title,
                    description: formData.description,
                    markdown: cleanMarkdown,
                    isPublic: formData.isPublic
                }
            }
        ]);
    if (!article) {
        res.status(500).json(new ApiResponse(401, {}, "couldn't update the article, try again", 401));
        throw new Error("DB error in article Updation");
    }
    res.status(200).json(new ApiResponse(200, article, "updated the Article", 200));

});

const deleteArticle = asyncHandler(async (req, res) => {
    const articleId = req.params.id;
    console.log("Deleted Article : ", articleId);
    if (!mongoose.isValidObjectId(articleId)) {
        res.status(400).json(new ApiResponse(400, {}, "Invalid article Id", 708))
    }
    const deletedArticel = await Articles.findOneAndDelete({
        _id: articleId,
        author: req?.user?._id
    });

    if (!deletedArticel) {
        res.status(500).json(new ApiResponse(500, {}, "Couldn't delete the article", 500));
        throw new Error("Couldn't Delete article.");
    }
    res.status(200).json(new ApiResponse(200, deleteArticle, "Deleted The Article", 200));
});

const getArticlesInBatch = async (req, res) => {
    const {page,batchSize = 10} = req.query;
    const skips = (page-1)*batchSize;
    
    const blogs = (await Articles.aggregate([
        {
            $match: {
                isPublic: true
            }
        },
        {   
            $sort:{
                updatedAt:-1,
            }
        },
        {
            $skip:skips
        },
        {
            $limit:batchSize
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $project: {
                            refreshToken: 0,
                            role: 0,
                            password: 0,
                            email: 0
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$author"
        }
    ]));

    res.status(200).json(new ApiResponse(200,blogs,"Blogs Fetched"))
}

const getMyArticlesInBatch = async (req, res) => {
    const {page,batchSize = 10} = req.query;
    const skips = (page-1)*batchSize;
    const blogs = (await Articles.aggregate([
        {
            $match: {
                author: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {   
            $sort:{
                updatedAt:-1,
            }
        },
        {
            $skip:skips
        },
        {
            $limit:batchSize
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $project: {
                            refreshToken: 0,
                            role: 0,
                            password: 0,
                            email: 0
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$author"
        }
    ]));
    res.status(200).json(new ApiResponse(200,blogs,"Blogs Fetched"))
}


export {
    createShow,
    createArticle,
    updateShow,
    updateArticle,
    showPublicArticles,
    showPrivateArticles,
    deleteArticle,
    getArticle,
    getArticlesInBatch,
    getMyArticlesInBatch
}


