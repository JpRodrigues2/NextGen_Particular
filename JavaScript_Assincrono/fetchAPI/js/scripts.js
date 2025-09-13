const url = "https://jsonplaceholder.typicode.com/posts";

const loadingElement = document.querySelector('#loading');
const postsContainer = document.querySelector('#posts-container');

const postPage = document.querySelector('#post')
const postContainer = document.querySelector('#post-container');
const commentsContainer = document.querySelector('#comments-container');

const commentsForm = document.querySelector('#comments-form');
const emailInput = document.querySelector('#email');
const bodyInput = document.querySelector('#body');

//get id from url
const urlSearchParams = new URLSearchParams(window.location.search);
const postId = urlSearchParams.get('id');

// get all posts

async function getAllPosts(){
    const response = await fetch(url)
    const data = await response.json();
    console.log(data);

    loadingElement.classList.add('hide');

    data.map(post => {

        const div = document.createElement('div');
        const title = document.createElement('h2');
        const body = document.createElement('p');
        const link = document.createElement('a');

        title.innerText = post.title;
        body.innerText = post.body;
        link.innerText = 'Ler';
        link.setAttribute('href', `post.html?id=${post.id}`);

        div.appendChild(title);  // cria uma div com o title (appendChild joga o conteudo dentro da div)
        div.appendChild(body);
        div.appendChild(link);

        postsContainer.appendChild(div); // joga a div criada dentro do postsContainer (que é a section ja criada do html)
        
    })
}

//get individual post

async function getPost(id) {
    const [responsePost, responseComments] = await Promise.all([
        fetch(`${url}/${id}`),
        fetch(`${url}/${id}/comments`)
    ]);

    const dataPost = await responsePost.json();
    const dataComments = await responseComments.json();

    loadingElement.classList.add('hide');
    postPage.classList.remove('hide');


    const title = document.createElement('h2');   // cria elementos 
    const body = document.createElement('p'); 

    title.innerText = dataPost.title;       // cria texto com conteudo da api
    body.innerText = dataPost.body;

    postContainer.appendChild(title);   // joga os elementos criados dentro do postContainer (section ja criada no html)
    postContainer.appendChild(body);

    dataComments.map((comment) => {
        createComment(comment);
    })
}    

function createComment(comment) {
    const div = document.createElement('div');
    const email = document.createElement('h3');
    const body = document.createElement('p');

    email.innerText = comment.email;
    body.innerText = comment.body;

    div.appendChild(email);
    div.appendChild(body);

    commentsContainer.appendChild(div);
}


async function postComment(comment) {

    const response = await fetch(`${url}/${postId}/comments`, {
        method: 'POST',
        body: comment, 
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const data = await response.json()
    createComment(data);
}






if(!postId) {
    getAllPosts();
} else {
    getPost(postId);

    commentsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let comment = {
            email: emailInput.value,
            body: bodyInput.value,
            
        }

        comment = JSON.stringify(comment);

        postComment(comment);
    })
}