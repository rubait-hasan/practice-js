const form = document.querySelector('form');

form.addEventListener('submit',event =>{
    event.preventDefault();

    const messageForm = document.querySelector('#message-form');
    const linkForm = document.querySelector('#link-form');
    messageForm.classList.add('hide');
    linkForm.classList.remove('hide');

    const input = document.querySelector('#message-input');
    const encrypted =  btoa(input.value);

    const linkInput = document.querySelector('#link-input');
     linkInput.value =`${window.location}#${encrypted}`;
     linkInput.select();
})

const {hash} = window.location;
const message = atob(hash.replace('#',''));

if(message){
    document.querySelector('#message-form').classList.add('hide');
    
    document.querySelector('#message-show').classList.remove('hide');

    document.querySelector('#message-show h1').innerHTML = message;
}