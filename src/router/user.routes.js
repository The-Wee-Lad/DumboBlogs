import {Router}  from "express";
import { 
    registerUser, 
    refreshAccessToken, 
    loginUser, 
    logoutUser,
    getCurrentUser,
    updatePassword,
    updateUser
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route('/').get((req,res) => {
    res.redirect('/');
});

router.route('/register')
.get((req,res)=>{
    res
    .set("Cache-Control","no-store, no-cache, must-revalidate, private")
    .render('userRegister',{title:"SignUp Page"});
})
.post(registerUser);

router.route('/login')
.get((req,res)=>{
    // console.log("params : ",req.params);
    res
    .set("Cache-Control","no-store, no-cache, must-revalidate, private")
    .render("userLogin",{title: "Login Page"});
})
.post(loginUser);

router.route('/isUserLoggedIn')
.get(verifyJWT,getCurrentUser);

router.route('/getCurrentUser')
.get(verifyJWT,getCurrentUser);

router.route("/refreshAccessToken")
.post(refreshAccessToken);

router.route("/logout")
.get(verifyJWT,logoutUser);

router.route("/accounts")
.get((req,res)=>{
    res.status(200).render("Account",{title:"User"});
})
router.route("/accounts/updateUser").post(verifyJWT,updateUser);
router.route("/accounts/updatePassword").post(verifyJWT,updatePassword);

export default router;