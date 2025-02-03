import {Router}  from "express";

const router = Router();

router.route('/').get((req,res) => {
    res.render('HomePage',{title:"Home"});
});

router.route('/about').get((req, res) => {
    res.render("AboutUs",{title:"About Us"});
}
);
router.route('/privacyPolicy').get((req, res) => {
    res.render("PrivacyPolicy",{title:"Privacy Policy"});
}
);




export default router;