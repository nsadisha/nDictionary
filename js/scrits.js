const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});  

const form = document.querySelector('#dictionary-form')
const playBtn = element('#play-btn')
const resultSection = element('#result-section')
const errorSection = element('#error-section')
const clearBtn = element('#clear-btn')

//init
window.addEventListener('load', event => {
    checkClearBtn()
})

clearBtn.addEventListener('click', event => {
    form.word.value = ""
    hideErrorSection()
    hideResultsSection()
})

form.word.addEventListener('keyup', event => {
    checkClearBtn()
})

form.addEventListener('submit', event => {
    var searchTerm = form.word.value

    if(searchTerm.split(" ").length > 1){
        Swal.fire(
            {
                title: 'Oops!',
                text: "You can search words only.",
                icon: 'error',
            }
          )
        return
    }
})

var searchTerm = params.word
if(searchTerm){
    resultSection.styles
    form.word.value = searchTerm
    getResults(searchTerm).then(responce => {

        if(responce.status == 200){
            hideErrorSection()
            showResultsSection()
            showResults(responce.json())
        }else if(responce.status == 404){
            Swal.fire(
                {
                    title: 'Oops!',
                    text: "Sorry! We couldn't find the word \""+searchTerm+"\".",
                    icon: 'error',
                }
            )
            showErrorSection()
        }
    })
}

async function showResults(_data){
    var data = await _data
    data = await data[0]

    setValue('search-word', data.word)
    setValue('phonetic', data.phonetic)

    
    if(data.phonetics.length == 0){
        playBtn.setAttribute("disabled", "true");
    }else{
        var audioUrl = data.phonetics[0].audio
        playBtn.addEventListener('click', e => {
            var audio = new Audio(audioUrl)
            audio.play();
        })
    }

    data.meanings.forEach(item => {
        element('#meanings-section').innerHTML += createMeanings(item)
    })
}

function checkClearBtn(){
    if(form.word.value != ""){
        clearBtn.classList.remove('d-none')
    }else{
        clearBtn.classList.add('d-none')
    }
}

function showResultsSection(){
    resultSection.classList.add('d-block')
    resultSection.classList.remove('d-none')
}
function hideResultsSection(){
    resultSection.classList.remove('d-block')
    resultSection.classList.add('d-none')
}

function showErrorSection(){
    errorSection.classList.add('d-block')
    errorSection.classList.remove('d-none')
}
function hideErrorSection(){
    errorSection.classList.remove('d-block')
    errorSection.classList.add('d-none')
}

async function getResults(word) {
    try {
        return fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+word).then(res => {
        return res;
    })
    } catch (error) {
        console.log(err);
    }
}

function setValue(id, value){
    if(value == null || value == undefined){
        return
    }
    element('#'+id).innerHTML = value
}

function element(q){
    return document.querySelector(q)
}

function createMeanings(meaning){
    return `<div class="meaning">
    <h4><i>${meaning.partOfSpeech}</i></h4>
    <div class="similar-words mb-3">
        ${createSimilarWors(meaning.synonyms)}
    </div>
    <div class="definition">
        <h5>Definitions</h5>
        <ul>
            ${createDefinitions(meaning.definitions)}
        </ul>
    </div>
</div>`
}

function createDefinitions(defs){
    var definitions = ""
    defs.forEach(def => {
        definitions += `<li class="text-secondary">${def.definition}</li>`
    })
    return definitions
}

function createSimilarWors(items){
    var synonyms = `<span class="text-success">Similar: </span>`

    items.forEach(item => {
        synonyms += `<a href="?word=${item}" class="no-link"><span class="word">${item}</span></a>`
    })

    if(items.length > 0){
        return synonyms
    }else{
        return ""
    }
}