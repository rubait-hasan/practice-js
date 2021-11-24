const autoCompleteConfig = {
    renderOption(movie){
        const imgSrc = movie.Poster === "N/A" ? '' : movie.Poster;
        return `
        <img src ="${imgSrc}"/>
         ${movie.Title} (${movie.Year})
    `
    },
    inputValue(movie){
        return movie.Title;
    },
    async fetchData(searchTerm){
        const response = await axios.get('http://www.omdbapi.com/',{
            params:{
                apikey: '7cc40853',
                s: searchTerm
            }
        });
            if(response.data.Error){
                return [];
            }
        
            return response.data.Search;
    }
}

//Left search bar
createAutocomplete({
    ...autoCompleteConfig,
    root:document.querySelector('#left-autocomplete'),
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie,document.querySelector('#left-summary'),'left');
    },
    
});
//Right search bar
createAutocomplete({
    ...autoCompleteConfig,
    root:document.querySelector('#right-autocomplete'),
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie,document.querySelector('#right-summary'),'right');
    },
    
});
let leftMovie, rightMovie;
const onMovieSelect = async (movie, summaryElement,side) =>{
    const response = await axios.get('http://www.omdbapi.com/',{
        params:{
            apikey: '7cc40853',
            i: movie.imdbID
        }
    });
    summaryElement.innerHTML = movieTemplate(response.data);
    if('left' === side){
        leftMovie = response.data;
    }else{
        rightMovie = response.data
    }
    if(leftMovie && rightMovie){
        runComparison();
    }
}

const runComparison = () =>{
    const leftSideStats = document.querySelectorAll('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');
    leftSideStats.forEach((leftStat, index)=>{
        const rightStat = rightSideStats[index];
        const leftSideValue = parseInt(leftStat.dataset.value);
        const rightSideValue = parseInt(rightStat.dataset.value);
        
        if(leftSideValue > rightSideValue){ 
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-danger');
        }else{
            leftStat.classList.remove('is-primary');
            leftStat.classList.add('is-danger');
        }
    })
}
// const valueCheck = () =>{
//     if()
// }
const movieTemplate = movieDetail =>{
    const awards        = movieDetail.Awards ? movieDetail.Awards:'';
    const boxOffice     = movieDetail.BoxOffice ? movieDetail.BoxOffice:'';
    const metaScore     = movieDetail.Metascore ? movieDetail.Metascore : '';
    const imdbRating    = movieDetail.imdbRating ? movieDetail.imdbRating : '';
    const imdbVotes     = movieDetail.imdbVotes ? movieDetail.imdbVotes : '';
    console.log(imdbVotes);

    const dollars       = boxOffice? parseInt(boxOffice.replace(/\$/g,'').replace(/,/g,'')) : '';
    const metaValue     = metaScore? parseInt(metaScore) : '';
    const imdbratingValue   = imdbRating? parseFloat(imdbRating) : '';
    const imdbvotesValue    = imdbVotes ? parseInt(imdbVotes.replace(/,/g,'')) : ''; 

    const awardsValue       = awards? awards.split(' ').reduce((prev,word)=>{
        const value = parseInt(word);
        if(isNaN(value)){
            return prev;
           
        }else{
            return prev+value;
        }
    },0) : '';

    return`
        <article class ="media">
            <figure class="media-left">
                <p class ="image">
                    <img src="${movieDetail.Poster}"/>
                </p>
            </figure>
            <div class ="media-content">
                <div class ="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>
        ${movieInfo(awards,'Awards',awardsValue)}
        ${movieInfo(boxOffice,'Box office',dollars)}
        ${movieInfo(metaScore,'Meta Score',metaValue)}
        ${movieInfo(imdbRating,'Rating',imdbratingValue)}
        ${movieInfo(imdbVotes,'Votes',imdbvotesValue)}
    `   
}

const movieInfo = (obj={}, subtile,dataValue) =>{
    if(isNaN(dataValue)){
        dataValue = 0;
    }
        return`
        <article data-value=${dataValue} class = "notification is-primary">
            <p class ="title">${obj}</p>
            <p class ="subtitle">${subtile}</p>
        </article>
    `  
}

