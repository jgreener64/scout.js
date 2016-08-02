//Collects all the paragraphs <p> in the page and puts them into an array called bodyText
var bodyText = document.body.getElementsByTagName("p");

//Reads the databse.js file into an array
var words = JSON.parse(keywordsDatabase);

for(y = 0; y < bodyText.length; y++) {
    for(x = 0; x < words.keywords.length; x++) {        
        var word = words.keywords[x];
        
        //The "g" in the "gi" stands for global, meaning that all occurences of a keyword will be labelled instead of only the first occurence. The "i" means that the search is not case sensitive.
        var keyword = new RegExp("\\b(" + word.name + ")\\b", "gi");
        
        if (keyword.exec(bodyText[y].textContent)) {
            var spanString = "<span class='scout-js-outline' data-title='" + word.title + "' data-description='" + word.description + "' data-url='" + word.url + "'>" + word.name + "</span>";
            bodyText[y].innerHTML = bodyText[y].innerHTML.replace(keyword, spanString);
        }
    }
}

// Once the keyword check has finished, we collect all the keywords found in an array by searching for the class that we attatched to the <span> tag above

var highlightedWords = document.body.getElementsByClassName("scout-js-outline");

//The three variables defined below are used to track the creation of the pop-up form outisde of the individual functions - formActive tracks if a pop-up is visible, okayToKillForm is used to give permission to kill open pop-ups and highlightedKeyword contains the object of the current pop-up's respective keyword.

var formActive = false;
var okayToKillForm = true;
var highlightedKeyword = null;

// So now the nitty gritty - we cycle through each keywordn span and add Event Listeners which check for mouse hover and mouse leave - when the mouse hovers over the keyword span, we call the createForm method and pass it the keyword object so that we can later determine the keyword span's position and render the informational pop-up in the correct place on the page. When the mouse leaves the keyword span, we call the killForm function to kill all the forms on the page (this massacre is okay as there will only be one form active at a time!).

for (var word of highlightedWords) {
    addListeners(word);
}

function addListeners (word) {
    word.addEventListener("mouseenter", function(event) {
        if (formActive == true && highlightedKeyword != word) {
            console.log("yolo");
            okayToKillForm = true;
            killForm(highlightedKeyword);
        }
        
        highlightedKeyword = word;
        word.style.backgroundColor="rgba(169,225,196,0.8)";        
        
        if (!formActive) {
            var form = createForm(word);
            
            form.addEventListener("mouseenter", function(event) {
                okayToKillForm = false;
            });
            form.addEventListener("mouseleave", function(event) {
                okayToKillForm = true;
                
                setTimeout(function() {
                    killForm(word);
                }, 200);
            });  
        }
        else {
            okayToKillForm = false;
        }
    });
    word.addEventListener("mouseleave", function(event) {
        okayToKillForm = true;
        setTimeout(function() {
            killForm(word);
        }, 200);       
    });
}

//createForm() does what it says on the tin - it renders a form on the page using styles specified in the style.css file. The form_html array contains the inner html of the form, and is collapsed down using join('') to make it into a single string. This string is then added to a <div> element, which is given the class of 'scout-js-form'. We then insert the form before the first element in the body. This is okay as the form is absolutely positioned, and so shouldn't (in theory) damage the page layout.

function createForm (label) {
    
    var title = label.getAttribute('data-title');
    var description = label.getAttribute('data-description');
    var url = label.getAttribute('data-url');
    
    var form_html = [
    '<h2>' + title + '</h2>',
    '<p>' + description + '</p>',
    '<a class="scout-js-main-button" href="#">Button to do something</a>',
    '<a class="scout-js-meta" href="http://' + url + '" target="_blank">' + url + '</a></div>'
    ].join('');
    
    var form = document.createElement('div');
    form.setAttribute('class', 'scout-js-form');
    
    form.innerHTML = form_html;    
    formActive = true;
    okayToKillForm = true;    
    form.style.visibility = "hidden";    
    document.body.insertBefore(form, document.body.firstChild);
    
    //In the lines directly above, we insert the pop-up form into the page as invisible. This is so that we can determine the height of the rendered pop-up. If the height of the pop-up is great than the distance between the keyword span and the bottom of the browser window, then we position the pop-up above the keyword (to avoid the pop-up running off the page). Otherwise, we position the pop-up below the keyword. We then make the pop-up visible.
    
    var position = getCoords(label);
    if (form.offsetHeight >= window.innerHeight - label.offsetTop + label.offsetHeight + 10) {
        //Put the pop-up above the keyword              
        form.style.top=(position.top-form.offsetHeight - 10)+"px";
        form.style.left=position.left+"px";
    }
    else {
        //Put the pop-up below the keyword        
        form.style.top=(position.top+28)+"px";
        form.style.left=position.left+"px";
    }
    
    form.style.visibility = "visible";
    return form;
}

// killForm() removes all the active forms on the page

function killForm(word) {
    if (okayToKillForm) {                
        var forms = document.body.getElementsByClassName("scout-js-form");
        word.style.backgroundColor="rgba(169,225,196,0)";
        while(forms[0]) {       
            forms[0].parentNode.removeChild(forms[0]); 
            formActive = false;
        }
    }
}

// Function to get position of elements on the page (thanks to Stack Overflow user 'basil' for this snippet - http://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document)

function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}
