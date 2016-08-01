//Collects all the paragraphs <p> in the page and puts them into an array called bodyText

var bodyText = document.body.getElementsByTagName("p");
var words = ["Wordpress", "CSS", "test"];

for(y = 0; y < bodyText.length; y++) {
    for(x = 0; x < words.length; x++) {        
        var word = words[x];
        //The "g" in the "gi" stands for global, meaning that all occurences of a keyword will be labelled instead of only the first occurence
        var keyword = new RegExp("\\b(" + word + ")\\b", "gi");
        
        if (keyword.exec(bodyText[y].textContent)) {
            var spanString = "<span class='jargon-bust-outline'>" + word + "</span>";
            bodyText[y].innerHTML = bodyText[y].innerHTML.replace(keyword, spanString);
        }
    }
}

// Once the keyword check has finished, we collect all the keywords found in an array by searching for the class that we attatched to the <span> tag above

var highlightedWords = document.body.getElementsByClassName("jargon-bust-outline");

// Then we cycle through each span and add Event Listeners which check for mouse hover and mouse leave - when the mouse hovers over the keyword label, we call the createForm method and pass it the labels co-ordinates in order to render a jargon explaination form on the page in the correct place. When the mouse leaves the keyword label, we call the killForm function to kill all the forms on the page (this massacre is okay as there will only be one form active at a time!)

// This code section, and the line above, could/should be applied to the <span> as we create it in the previous code block. This would probably me much more efficient, as it saves us querying and looping through the DOM again.

var okayToKillForm = true;
var formActive = false;

for (var word of highlightedWords) {
    addListeners(word);
}

function addListeners (word) {
    word.addEventListener("mouseenter", function(event) {
        word.style.backgroundColor="rgba(169,225,196,0.8)";
        if (!formActive) {
            var form = createForm(word);
            console.log(word);
            
            form.addEventListener("mouseenter", function(event) {
                okayToKillForm = false;
            });
            form.addEventListener("mouseleave", function(event) {
                okayToKillForm = true;
                
                setTimeout(function() {
                    killForm(word);
                }, 250);
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
        }, 250);       
    });
}

//createForm() does what it says on the tin - it renders a form on the page using styles specified in the style.css file. The form_html array contains the inner html of the form, and is collapsed down using join('') to make it into a single string. This string is then added to a <div> element, which is given the class of 'jargon-bust-form'. We then insert the form before the first element in the body. This is okay as the form is absolutely positioned, and so shouldn't (in theory) damage the page layout.

function createForm (label) {
    var star = chrome.extension.getURL("img/star2.png");
    var browser = chrome.extension.getURL("img/www.png");
    
    var form_html = [
    '<h2>Wordpress</h2>',
    '<p>Free and open-source web software that can be used to create  websites with dynamic functionality (e.g blogging, e-commerce). Wordpress is based on PHP and MySQL, and is the most popular blogging system in use on the Web.</p>',
    '<a class="main-button" href="www.google.com">View on JargonBust.com</a>',
    '<a class="icon" href="www.google.com">wordpress.org</a></div>'
    ].join('');
    
    var form = document.createElement('div');
    form.setAttribute('class', 'jargon-bust-form');
    
    var position = getCoords(label);
    form.style.top=(position.top+28)+"px";
    form.style.left=position.left+"px";
    
    form.innerHTML = form_html;    
    formActive = true;
    okayToKillForm = true;
    
    document.body.insertBefore(form, document.body.firstChild);
    return form;
}

// killForm() removes all the active forms on the page

function killForm(word) {
    if (okayToKillForm) {                
        var forms = document.body.getElementsByClassName("jargon-bust-form");
        word.style.backgroundColor="rgba(169,225,196,0)";
        while(forms[0]) {       
            forms[0].parentNode.removeChild(forms[0]); 
            formActive = false;
        }
    }
}

// Function to get position of keyword labels on the page (thanks to Stack Overflow user 'basil' for this snippet - http://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document)

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