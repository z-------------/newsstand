var xhr = function(url,callback) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function(){
        var response = this.responseText;
        callback(response);
    };
    oReq.open("get", url, true);
    oReq.send();
};

var arraysEqual = function(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    
    a.sort();
    b.sort();

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    
    return true;
};

var msnry;
var msnryInterval;

function getFeeds(topics) {
    streamElem.innerHTML = "";
    streamContainerElem.classList.add("loading");
    
    xhr("py/feeds.py?" + topics.join(","), function(r){
        if (msnryInterval) {
            clearInterval(msnryInterval);
        }
        
        streamElem.innerHTML = "";
        
        r = JSON.parse(r).filter(function(entry){
            var published = new Date(entry.publishedDate).getTime();
            var now = new Date().getTime();
            return (now - published <= 259200000);
        });
        
        r.sort(function(a, b){
            aDate = new Date(a.publishedDate).getTime();
            bDate = new Date(b.publishedDate).getTime();

            if (aDate > bDate) return -1;
            if (aDate < bDate) return 1;
            return 0;
        });

        r.forEach(function(data){
            var title = data.title;
            var date = moment(data.publishedDate).format("ddd D/M, h:mm A");
            var url = data.link;
            var snippet = data.contentSnippet;
            var content = data.content;
            var topic = data.newsstandTopic;

            var aElem = document.createElement("a");
            aElem.innerHTML = "<li><h3></h3><time></time><p></p></li>";

            aElem.href = url;

            aElem.querySelector("h3").innerHTML = title;
            aElem.querySelector("p").innerHTML = snippet;
            aElem.querySelector("time").textContent = date;
            
            var firstImg = (function(html, selector){
                var element = document.createElement("div");
                element.innerHTML = html;
                return element.querySelector(selector);
            })(content, "img");
            
            if (firstImg) {
                firstImg.removeAttribute("width");
                firstImg.removeAttribute("height");
                aElem.querySelector("p").insertBefore(firstImg, aElem.querySelector("p").childNodes[0]);
            }
            
            aElem.querySelector("li").dataset.topic = topic;

            streamElem.appendChild(aElem);
        });
        
        streamContainerElem.classList.remove("loading");

        msnry = new Masonry(streamElem, {
            itemSelector: "li",
            transitionDuration: "0"
        });

        msnry.layout();
        
        msnryInterval = setInterval(function(){
            msnry.layout();
        }, 3000);
    });
}

var availableTopics = ["world", "business", "politics", "health", "science", "tech", "entertainment", "art"];

var streamContainerElem = document.querySelector("#stream_container");
var streamElem = document.querySelector("#stream");
var headerElem = document.querySelector("header");

var asideElem = document.querySelector("aside");
var topicsElem = document.querySelector("aside #topics_choose");

var ui = {};
ui.burger = document.querySelector(".ui.burger");

ui.burger.addEventListener("click", function(){
    if (!document.body.classList.contains("nav_opened")) {
        oldTopics = userTopics;
    }
    if (document.body.classList.contains("nav_opened") && !arraysEqual(userTopics, oldTopics)) {
        getFeeds(userTopics);
    }
    document.body.classList.toggle("nav_opened");
});

var userTopics = (localStorage.getItem("newsstand_topics") || availableTopics.join(",")).split(",");
var oldTopics;

availableTopics.forEach(function(topic){
    var labelElem = document.createElement("label");
    
    labelElem.innerHTML = "<input type='checkbox'><span>" + topic + "</span>";
    labelElem.dataset.topic = topic;
    
    if (userTopics.indexOf(topic) !== -1) {
        labelElem.querySelector("input[type=checkbox]").checked = true;
        labelElem.classList.add("checked");
    }
    
    labelElem.addEventListener("change", function(){
        var newTopics = [];
        
        [].slice.call(document.querySelectorAll("aside label")).forEach(function(elem){
            if (elem.querySelector("input").checked) {
                newTopics.push(elem.textContent);
            }
        });
        
        localStorage.setItem("newsstand_topics", newTopics.join(","));
        
        userTopics = newTopics;
        
        if (this.querySelector("input").checked) {
            this.classList.add("checked");
        } else {
            this.classList.remove("checked");
        }
    });
    
    topicsElem.appendChild(labelElem);
});

getFeeds(userTopics);

streamContainerElem.addEventListener("scroll", function(){
    if (this.scrollTop > 0) {
        headerElem.classList.add("float");
    } else {
        headerElem.classList.remove("float");
    }
});