let isFetching = 0;
console.log("My Blogs");
document.querySelector(".createButton").addEventListener("click",toCreatePage);
const blogTemplate = document.querySelector("#blogTemplate").content;
const blogContainer = document.querySelector(".blogs");
const heading = document.querySelector(".heading");
let startPage = 1;


function createBlogCard(blogObject) {
    const newBlog = blogTemplate.cloneNode(true);
    newBlog.querySelector(".blog-card").id = blogObject.id;
    newBlog.querySelector(".blog-title").textContent = blogObject.title;
    newBlog.querySelector(".blog-description").textContent = blogObject.description;
    newBlog.querySelector(".blog-author").textContent = blogObject.author;
    newBlog.querySelector(".blog-date").textContent = blogObject.date;
    const status = newBlog.querySelector(".blog-status");
    if(blogObject.isPublic){
        status.textContent = "Public";
        status.classList.add("public");
    }else{
        status.textContent = "Private";
        status.classList.add("private");
    }
    return newBlog;
}

function renderBlogs(array){

    // array.forEach(element => {
    //     if(blogContainer.contains(document.querySelector(`#${element.id}`))){
    //         // blogContainer.append(element);
    //         console.log("duplicate",element);
            
    //     }
    //     console.log("duplicate",element.querySelector(".blog-card").id);
    // });
    blogContainer.append(...array);
}

async function processFetchData(array){
    const newArray = array.map(element => {
        const blogObject = {};
        blogObject.id = element._id
        blogObject.title = element.title,
        blogObject.description = element.description,
        blogObject.markdown = element.markdown,
        blogObject.isPublic = element.isPublic,
        blogObject.date = "Last Updated At : "+new Date(element.updatedAt).toLocaleString(),
        blogObject.author = element?.author?.fullname || element?.author?.username
        const blogCard = createBlogCard(blogObject);
        return blogCard;
    }

    );
    return newArray;
}

async function fetchBlogs(nextPage){
    try {
        const response = await axios.get(`/api/v1/articles/fetchBlogs?page=${nextPage}`);
        const blogs = response.data.data;
        return blogs;
    } catch (error) {
        console.log("Blogs fEtch wrror : ",error);
        if(error.response.data.code == 709){
            try {
                console.log("Refreshing Access Token in fetch my blogs");
                await axios.post("/api/v1/user/refreshAccessToken");
                console.log("Refreshed Token");
                return await fetchBlogs(nextPage);
            } catch (error) {
                console.log("Freash Token Error? ", error);
                window.location.replace(`/api/v1/user/login?redirect=${window.location.pathname}`);
            }
        } else{
            console.log("505 network error or Db error or Invalid Login")
            window.location.replace('/');
        }
    }
}

async function moreBlogs() {
    setFetchStatus(1);
    
    let page = +(new URLSearchParams(window.location.search).get("page") ?? 0);
    page++;
    console.log("making Request");
    const fetchedArray = await fetchBlogs(page);
    if(fetchedArray.length ==0){
        setFetchStatus(-1);
        return;
    }
    const proccessedArray = await processFetchData(fetchedArray);
    renderBlogs(proccessedArray);
    setFetchStatus(0);
    history.replaceState(null,null,`${window.location.pathname}?page=${page}`);
}
function setFetchStatus(state){
    isFetching=state;
    let message = document.createElement("div");
    message.className = "fetchMessage";
    blogContainer.querySelector(".fetchMessage")?.remove();
    if(state == 1){
        message.textContent="Fetching.....";
        blogContainer.append(message);
    }
    else if(state==0){
        blogContainer.querySelector(".fetchMessage")?.remove();
    }
    else if(state==-1){
        message.textContent="No More Blogs left to see";
        blogContainer.append(message);
    }
    else{
        message.textContent="You have not Created any blogs yet!!! Start Now";
        blogContainer.append(message);
    }
}

let prevScrollTop = document.querySelector(".right-pane").scrollTop;
let fetchMessage = document.querySelector(".fetchMessage");

document.querySelector(".right-pane").addEventListener("scroll",(event) => {
    const obj = event.target;
    let currentScrollTop = obj.scrollTop;
    if(currentScrollTop>prevScrollTop && currentScrollTop>=200){
        heading.style.transform = "translateY(-100%)";
        heading.style.opacity = "0";
    }
    else if(currentScrollTop<prevScrollTop){
        heading.style.transform = "translateY(0)";
        heading.style.opacity = "1";
    }
    prevScrollTop=currentScrollTop;
});

const scrollFetch = async (event) => {
    const obj = event.target;;
    if(obj.scrollTop+obj.offsetHeight+100 >= obj.scrollHeight){
        console.log("Not Right Now");
        if(isFetching != 1){
            moreBlogs();
        }
    }
}

async function initialSetup() {
    const target = (new URLSearchParams(window.location.search).get("page")||1);
    const initialArray = [];
    setFetchStatus(1);
    while(startPage<=target){
        let temp = await fetchBlogs(startPage);
        
        if(temp.length == 0){
            setFetchStatus(-1);
            break;
        }
        initialArray.push(...temp);
        startPage++;
    }
    // console.log("this is it:",initialArray);
    
    const proArrray = await processFetchData(initialArray);
    renderBlogs(proArrray);
    setFetchStatus(0);
    
    if(initialArray.length == 0){
        setFetchStatus(3);
    }
    history.replaceState(null,null,`${window.location.pathname}?page=${target}`);
    console.log("Initial Page filled, scroll works now....");
    document.querySelector(".right-pane").addEventListener("scroll",scrollFetch);
    
}

blogContainer.addEventListener('click',async (event) => {
    const clickedBlogCard = event.target.closest(".blog-card");
    if(clickedBlogCard.className == "blog-card"){
        const articleId = clickedBlogCard.id;
        blogContainer.disabled = true;
        window.location.href = `/api/v1/articles/show/${articleId}`;
    }
})

initialSetup();