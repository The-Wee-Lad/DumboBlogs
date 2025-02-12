// import { Articles } from "../../models/articles.model";

// import { AxiosError } from "axios";
const messageDiv = document.querySelector(".message");
const shareBtn = document.querySelector(".btn-three");
const sharePopup = document.querySelector(".share-popup");
const shareLink = document.querySelectorAll(".shareLink");
const updateBtn = document.querySelector(".btn-four");
const likeBtn = document.querySelector(".btn-two");
const articleMeta = document.querySelector(".article-data");
const articleId = window.location.pathname.split('/').pop();


const stateMessage = (error = false, message, reset = false) => {
    messageDiv.style.display = "flex"
    if (reset) messageDiv.style.display = "none";
    if (error) {
        messageDiv.style.backgroundcolor = "#f7e9e9";
        messageDiv.style.color = "#571515";
        messageDiv.style.border = "1px solid #e6c3c3";
    } else {
        messageDiv.style.backgroundcolor = "#e9f7ef";
        messageDiv.style.color = "#155724";
        messageDiv.style.border = "1px solid #c3e6cb";
    }
    messageDiv.textContent = message;
}

const timedMessage = async (error, message, reset) => {

    stateMessage(error, message, reset);
    await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            stateMessage(null, null, true);
            resolve(clearTimeout(timer));
        }, 3000);
    })
}



console.log(loginStatus);

const showSharePopup = (event) => {
    if (sharePopup.style.display == "flex") {
        sharePopup.style.display = "none";
        return;
    }
    const rect = shareBtn.getBoundingClientRect();
    sharePopup.style.left = `${rect.left + window.scrollX}px`
    sharePopup.style.top = `${rect.bottom + window.scrollY}px`;
    sharePopup.style.display = "flex";
};


let likeHandler1 = (event) => {
    console.log("Can't like withput Log in");
    timedMessage(true, "You Need to Log in to Like.")
};
let likeHandler2 = () => {
    console.log("Liked")
    timedMessage(false, "Likes Feature not implemented yet");
};
let updateBtnHandler = async () => {
    console.log("Going to Update button");
    timedMessage(false, "Redirecting to Update Page");
    const articleId = window.location.pathname.split('/').splice(-1, 1);
    console.log(articleId, `/api/v1/articles/update/${articleId}`);
    window.location.replace(`/api/v1/articles/update/${articleId}`);
}

const shareContent = document.querySelector(".title").textContent;
const setInitialState = async () => {
    const response = (await checkLogin());
    loginStatus = response?.loginStatus;
    const user = response?.user;
    shareLink[0].href = `https://api.whatsapp.com/send?text=Hey! Check This Out : ${shareContent} : ${window.location.href}`;
    shareLink[1].href = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
    shareLink[2].href = `https://twitter.com/intent/tweet?url=${window.location.href}&text=Hey Check This Out : ${shareContent}`;

    if (loginStatus == true) {
        // console.log("user",user);
        await fillPage();
        console.log("dataset:", articleMeta.dataset);
        console.log("isPublic : ", typeof articleMeta.dataset.ispublic);
        console.log("isPublic Article", JSON.parse(articleMeta.dataset.ispublic));
        if (!JSON.parse(articleMeta.dataset.ispublic)) {
            document.querySelector(".isPublic").style.display = "flex";
        }
        if (user?._id == articleMeta.dataset.authorId) {
            console.log("Show Update Button");
            updateBtn.style.display = "flex";
            updateBtn.addEventListener('click', updateBtnHandler);
        }
        likeBtn.removeEventListener('click', likeHandler1);
        likeBtn.addEventListener('click', likeHandler2);
    } else {

        likeBtn.removeEventListener('click', likeHandler2);
        likeBtn.addEventListener('click', likeHandler1);
        window.location.replace('/api/v1/user/login');
    }
}

setInitialState();
shareBtn.addEventListener("click", showSharePopup);
document.addEventListener("click", (event) => {
    if (sharePopup.style.display == "flex"
        && event.target.classList[1] != ("btn-three")) {
        sharePopup.style.display = "none";
    }
});


async function fillPage() {
    console.log("Getting Page Data");
    try {
        const response = await axios.get(`/api/v1/articles/get/${articleId}`);
        const receivedArticle = response.data.data;
        document.querySelector(".title").textContent=receivedArticle.title;
        document.querySelector(".author-name").textContent=receivedArticle.author.fullname || receivedArticle.author.username;
        document.querySelector(".lastUpdatedAt").textContent=receivedArticle.updatedAt.toLocaleString();
        document.querySelector(".markdown").textContent=receivedArticle.markdown;
        
        articleMeta.dataset.ispublic = receivedArticle.isPublic;
        articleMeta.dataset.articleId = articleId;
        articleMeta.dataset.authorId = receivedArticle.author._id;

    } catch (error) {
        console.log("GET ARTICLE ERROR : ", error);
        if (error.response.data.code == 720) {
            stateMessage(true, "No Article  found or invalid Login[Private article]");
            console.log("Article Not Found or invalid Login[Private Article");
            await new Promise((res, rej) => {
                setTimeout(() => {
                    window.location.replace('/');
                    res("done");
                }, 5000);
            })
        }
        else if (error.response.data.code == 709) {
            stateMessage(true, "Refreshing Token in getArticle");
            try {
                console.log("Refreshing Access Token");
                await axios.post("/api/v1/user/refreshAccessToken");
                return await fillForm();
            } catch (error) {
                console.log("Refresh Token Is not Valif any more : ", error);
                stateMessage(true, "I am sorry, login again ...redirecting");
                await new Promise((res, rej) => {
                    setTimeout(() => {
                        window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
                        res(done);
                    }, 2000);
                })
            }
        } else {
            console.log("505 network error or Db error or Invalid Login")
            window.location.replace('/');
        }
    }
}