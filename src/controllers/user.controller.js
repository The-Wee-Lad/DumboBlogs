import { Users } from "../models/users.model.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly:true,
    secure:true,
}

const generateAccessAndRefreshToken = async(userid) => {
    try {
        const user = await Users.findById(userid);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();        
        return { accessToken, refreshToken};

    } catch (error) {
        throw Error(`Couldn't Generate refereshToken and accessToken : ${error}`);
    }
};

const refreshAccessToken = asyncHandler(async(req, res) => {
    console.log("Refreshing The Token");
    try {
        const receivedRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;
        let decodedRefreshToken;
        try {
            decodedRefreshToken = jwt.verify(receivedRefreshToken, process.env.REFRESH_TOKEN_SECRET);    
        } catch (error) {
            if(error.name == "TokenExpiredError"){
                res.status(401).json(new ApiResponse(401, {}, "Expired Refresh Token", 718));
                throw new Error("Expired Refresh Token [Refresh Access Token]");
            }
        }
        const userid = decodedRefreshToken?._id;
        const user = await Users.findById(userid);
    
        if(!user){
            res.status(401).json(new ApiResponse(401, {}, "Invalid Refresh Token", 718));
            throw new Error("Invalid Refresh Token [Refresh Access Token]");
        }
    
        const storedRefreshToken = user?.refreshToken;
    
        if(storedRefreshToken !==  receivedRefreshToken){
            res.status(401).json(new ApiResponse(401, {}, "Invalid Refresh Token", 718));
            throw new Error("Refresh Token Expired [Refresh Access Token]");
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user?._id);        
        
        res
        .status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken)
        .json(new ApiResponse(200,{accessToken, refreshToken}, "new accessToken generated successfully"));
    } catch (error) {
        throw new Error(`couldn't refresh Access Token [Refresh Access Token] ${error}`);
    }
});

const registerUser = asyncHandler(async(req, res) => {
    const {username, email, password} = req.body;
    // console.log(username,email,password);
    
    if(!username || !email || !password){
        return res.status(400).json(new ApiResponse(400, {},"All Fields Required", 700));
    }
    if(await Users.findOne({username:username.toLowerCase()})){
        return res.status(409).json(new ApiResponse(400, {},"Username Already in Use", 701));
    }
    if(await Users.findOne({email:email})){
        return res.status(409).json(new ApiResponse(400, {},"Email Already in use", 701));
    }

    const user =await Users.create({
        username:username,
        email:email,
        password:password,
    });

    if(!user){
        res.status(500).json(new ApiResponse(500, {},"User Registration failed Server Error", 703));
    }
    res.status(200)
    .set("Cache-Control","no-store, no-cache, must-revalidate, private")
    .json(new ApiResponse(200, {},"User Registered Successfully" ));
    }
);

const loginUser = asyncHandler(async (req,res) => {
    const {usernameOrEmail, password} = req.body;
    
    if(!usernameOrEmail || !password){
        return res.status(400).json(new ApiResponse(400, {},"All Fields Required", 700));
    }

    const user = await Users.findOne({
        $or : [
                {username:usernameOrEmail}
                ,{email:usernameOrEmail}
            ]
        });
    
    if(!user){
        return res.status(401).json(new ApiResponse(401, {},"Invalid Credentials", 707));
    }

    if(!await user.isPasswordCorrect(password)){
        return res.status(401).json(new ApiResponse(401, {},"Invalid Credentials", 707));
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user?._id);

    res
        .status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken,cookieOptions)
        .set("Cache-Control","no-store, no-cache, must-revalidate, private")
        .json(new ApiResponse(200,{user:user.isSelected("-password"),accessToken, refreshToken}, "Successfully Logged In"));
})



const logoutUser = asyncHandler(async (req, res) => {
    const user_id = req.user?._id;
    // console.log(user_id);
    const user = await Users.findByIdAndUpdate(user_id,{
        $unset:{refreshToken:""}
    });
    if(!user){
        res.status(500).json(new ApiResponse(500,{}, "Couldn't logout", 710));
        throw new Error("DB error on logout");
    }
    res.status(200)
    .clearCookie("refreshToken",cookieOptions)
    .clearCookie("accessToken",cookieOptions)  
    .set("Cache-Control","no-store, no-cache, must-revalidate, private")
    .json(new ApiResponse(200,{},"Logged out Successfully"));
}) 

const getCurrentUser = asyncHandler(async (req, res) => {
    if(!req?.user){
        throw new Error("Verification failed yet the data passed forward to getcurrentUser");
    }
    res.status(200).json(new ApiResponse(200, req?.user, "User Fetched!!", 200));
});

const updateUser = asyncHandler(async (req,res) => {
    const {username,email,fullname} = req.body;
    if(!username || !email){
        res.status(400).json(new ApiResponse(400,{},"Invalid Input",730));
        throw new Error("Invalid User Info. Can't Update");
        
    }
    // console.log("recieved data ",username,email,fullname);
    
    const existingUsername = await Users.aggregate([
        {
            $match:{
                username:username,
                _id:{$ne:new mongoose.Types.ObjectId(req?.user?._id)}
            }
        }
    ]);
    const existingEmail = await Users.aggregate([
        {
            $match:{
                email:email,
                _id:{$ne:new mongoose.Types.ObjectId(req?.user?._id)}
            }
        }
    ]);
    // console.log(existingUsername,existingEmail);
    if(existingUsername.length!=0){
        res.status(409).json(new ApiResponse(409,{},"Username Allready in use",731));
        throw new Error("Username Already in Use. Can't Update");
    }
    if(existingEmail.length!=0){
        res.status(409).json(new ApiResponse(409,{},"Email Allready in use",732));
        throw new Error("Email Already in Use. Can't Update");
    }

    const newUser=await Users.findByIdAndUpdate(req?.user?._id,{
        $set:{
            username:username,
            fullname:fullname,
            email:email
        }
    }).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200,newUser,"User Updated",200));
});

const updatePassword = asyncHandler(async(req, res) => {
    const user = await Users.findById(req?.user?._id);
    const {oldPassword, newPassword} = req.body;
    console.log(oldPassword,newPassword);
    
    // console.log((await user.isPasswordCorrect(oldPassword)));
    
    if(!(await user.isPasswordCorrect(oldPassword))){
        // console.log("Password Doesn't Work");
        
        res.status(409).json(new ApiResponse(407,{},"Invalid Old Password",733));
        throw new Error("Invalid Old Password");
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json(new ApiResponse(200,{},"Password Changed",200));
});

export {
    refreshAccessToken,
    generateAccessAndRefreshToken,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    cookieOptions,
    updatePassword,
    updateUser
}