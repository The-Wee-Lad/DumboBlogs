// import { AxiosError } from "axios";
const messageDiv = document.querySelector(".message");
const shareBtn = document.querySelector(".btn-three");
const sharePopup = document.querySelector(".share-popup");
const shareLink = document.querySelectorAll(".shareLink");
const updateBtn = document.querySelector(".btn-four");
const likeBtn = document.querySelector(".btn-two");
const articleMeta = document.querySelector(".article-data");

const stateMessage = (error = false,message, reset = false) => {
    messageDiv.style.display = "flex"
    if(reset)   messageDiv.style.display = "none";
    if(error){
        messageDiv.style.backgroundcolor = "#f7e9e9";
        messageDiv.style.color= "#571515";
        messageDiv.style.border= "1px solid #e6c3c3";
    } else{
        messageDiv.style.backgroundcolor = "#e9f7ef";
        messageDiv.style.color= "#155724";
        messageDiv.style.border= "1px solid #c3e6cb";
    }
    messageDiv.textContent = message;
}

const timedMessage = async (error, message, reset)=>{
    
    stateMessage(error, message, reset);
    await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            stateMessage(null,null,true);
            resolve(clearTimeout(timer));
        }, 3000);
    })
}



console.log(loginStatus);

const showSharePopup = (event) => {
    if(sharePopup.style.display == "flex"){
        sharePopup.style.display = "none";
        return;
    }
    const rect = shareBtn.getBoundingClientRect();
    sharePopup.style.left = `${rect.left+window.scrollX}px`
    sharePopup.style.top = `${rect.bottom + window.scrollY}px`;
    sharePopup.style.display = "flex";
};


let likeHandler1 = (event)=>{
    console.log("Can't like withput Log in");
    timedMessage(true,"You Need to Log in to Like.")
};
let likeHandler2 = ()=>{
    console.log("Liked")
    timedMessage(false,"Likes Feature not implemented yet");
};
let updateBtnHandler = async () => {
    console.log("Going to Update button");
    timedMessage(false,"Redirecting to Update Page");
    const articleId = window.location.pathname.split('/').splice(-1, 1);
    console.log(articleId,`/api/v1/articles/update/${articleId}`);
    window.location.replace(`/api/v1/articles/update/${articleId}`);
}

const shareContent = document.querySelector(".title").textContent.trim();
const setInitialState = async () => {
    const response =  (await checkLogin());
    loginStatus = response?.loginStatus;
    const user = response?.user;
    shareLink[0].href=`https://api.whatsapp.com/send?text=${shareContent} : ${window.location.href}`;
    shareLink[1].href=`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
    shareLink[2].href=`https://twitter.com/intent/tweet?url=${window.location.href}&text=${shareContent}`;
    
    if(loginStatus == true){
        // console.log("user",user);
        console.log("dataset:",articleMeta.dataset);
        console.log("isPublic : ",typeof articleMeta.dataset.ispublic);
        console.log("Private Article",JSON.parse(articleMeta.dataset.ispublic));
        if(!JSON.parse(articleMeta.dataset.ispublic)){
            document.querySelector(".isPublic").style.display="flex";
        }
        if(user?._id == articleMeta.dataset.authorId){
            console.log("Show Update Button");
            updateBtn.style.display="flex";
            likeBtn.removeEventListener('click',likeHandler1);
            likeBtn.addEventListener('click',likeHandler2);
            updateBtn.addEventListener('click',updateBtnHandler);
        }
    }else{
        likeBtn.removeEventListener('click',likeHandler2);
        likeBtn.addEventListener('click',likeHandler1);

    }
}

setInitialState();
shareBtn.addEventListener("click", showSharePopup);
document.addEventListener("click", (event) => {
    if(sharePopup.style.display == "flex" 
        && event.target.classList[1]!=("btn-three")){
        sharePopup.style.display = "none";
    }
});