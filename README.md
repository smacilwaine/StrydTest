# StrydTest

### Getting Started

Clone into the repo. Then, in the StrydTest folder, run **node main.js** in Terminal. This will launch the web server and initiate the process that collects comments from the DC Rainmaker article.

Next, navigate to a web browser and go to **localhost:8080**.

Type in the keyword(s) and press Enter or hit the Submit button. A new page of results will load and display the matching comments and corresponding tags. 

*Note*: It takes about 10 seconds for all the comments to load in the background, so if you have pressed Enter within 10 seconds of running **node main.js**, you may have to wait for a few seconds. I have purposely designed the code to not proceed to the next page until all the comments are loaded, but to save time, the comments begin loading as soon as **node main.js** is run, even if the web page is not open. The comments only need to load once.

If you wish to start again, simply press the Back button or navigate to **localhost:8080**.

### Description of Solution

*loadComments()*

The first function that runs in **main.js** is **loadComments()**, which uses axios, a Promise-based HTTP client, to extract HTML code from the DC Rainmaker web page. It tracks each html tag with the "comment-body" class, then uses jQuery to combine paragraphs within individual comments by creating a new div tag at the top of each comment and appending the text of each p tag to it, in addition to an extra space " ", before copying over all the text in the div tag to an array of strings called **list**. This ensures that the last letter of one paragraph is separated by a space from the first letter of the next paragraph, and that all paragraphs in the comment are treated as one block of text. The array of scripts, **list** is then copied into a global variable called **COMMENTS** to ensure easy access by other functions.

*loadWebPage()*

This function uses Node's http library to launch a web page. Its default page, which you see when you navigate to **localhost:8080**, is populated with the html code from the **index.html** file, which contains the html for the simple form that you enter keywords in. Once you hit Submit and the browser sends a POST request, **loadWebPage()** receives the entered keywords, writes the Results page in html, calls the **searchFn()**, calls **emotionDetector()** for each matching comment, and prints all the results and matching tags to the table in the Results page.

*searchFn()*

The comma search function takes in the comma-separated string of entered keywords and creates an array of keys. It also takes in the array of comments. To make the results case-insensitive, all keys and comments are reduced to lowercase. This function works by going through each key and checking every comment for an instance of that key using JavaScript's search method, which returns -1 if the target string is not found in full comment. Then, to make sure that the matching instance of that key is a full word, the program checks that both of the characters on either side of the instance are special characters (not alphanumeric letters). This way, "heads" will show up in "heads-up" (surrounded by a space and a hyphen), but not in "ahead". If an instance is found and it fails the "bookend" test, then the rest of the comment is still checked for additional valid instances of the keyword. 

*emotionDetector()*

The simple emotion detector function uses **retext-sentiment** to convert each paragraph into a tree of nodes, with each paragraph, sentence, word, and punctuation mark being assigned an emotion that which contributes to the average emotion of the full text. 

