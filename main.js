const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const http = require('http');
const querystring = require('querystring');
const sentiment = require('retext-sentiment');
const english = require('retext-english');
const unified = require('unified');
const vfile = require('to-vfile');
const report = require('vfile-reporter');
const inspect = require('unist-util-inspect');

let DONE = false;
let COMMENTS = [];

function emotionDetector(comment){
	var processor = unified().use(english).use(sentiment);
	var tree = processor.parse(comment.toString());
	processor.run(tree);
	return(tree.data.valence.toString());
}

function searchFn(keywords, comments){
	var keys = keywords.split(",");
	var matches = [];
	var k = 0;
	while (k < keys.length){
		testkey = keys[k].toLowerCase();
		for (var c in comments){
			var testString = comments[c].toString().toLowerCase(); //replace comments[c] with testy
			var s = testString.search(testkey);
			while (s != -1){
				// test the keyword found
				var first = testString.substring(s-1, s);
				var last = testString.substring(s+testkey.length, s+testkey.length+1);
				var f = (first == first.toUpperCase());
				var l = (last == last.toUpperCase());
				if (f && l){ // asser that keyword is surrounded by special characters
					matches.push(comments[c]);
					break;
				}
				else{
					// check for later instances of keyword in the same comment
					var testString = testString.substring(s+testkey.length+1, comments[c].length+1);
					s = testString.toLowerCase().search(testkey);
				}
			}
		}
		k++;
	}
	return matches;
}

async function loadComments() {
	let list = [];
	await axios({
		method: 'get',
		url: 'https://www.dcrainmaker.com/2015/01/stryd-first-running.html',
		responseEncoding: 'utf8'})
		.then((response) => {
				if (response.status === 200) {
					const webpage = response.data;
					const $ = cheerio.load(webpage);
					var num = 0;
					$('.comment-body').each(function(i, elem) {
						$(this).prepend('<div class="special"></div>');
						$(this).find('p').append('<p> </p>');
						$(this).find('p').appendTo('.special');
						var lis = $(this).find('.special').text().trim();
						list[i] = lis;
						num = num+1;
					});
					COMMENTS = list;
					DONE = true;
			}
		}, (error) => console.log(err) );
}

function loadWebPage() {
	http.createServer(function (req, res) {
	switch(req.url){
		case '/submit':
			if (req.method == 'POST'){
				var fullBody = "";
				req.on('data', function(data) {
					fullBody+= data.toString();
				});
				req.on('end', async function() {
					res.writeHead(200, "OK", { "Content-Type": "text/html; charset=utf-8" });
					res.write("<html><head>");
					res.write("<title>Search Results</title></head><body>");
					var body = querystring.parse(fullBody);
					var matches = searchFn(body.keywords, COMMENTS);
					res.write("<h3>Search Results for: "+body.keywords+"</h3><table border=1 style='width:100%'>");
					res.write("<h4>Total Matches: "+matches.length+"</h4>");
					for (var i in matches){
						var emotion = emotionDetector(matches[i]);
						res.write("<tr><td width='50%'>"+matches[i]);
						res.write("<font ");
						if (emotion == "positive"){
							res.write("color='green'> #"+emotion+"</font>");
						}
						else if (emotion == "negative"){
							res.write("color='red'> #"+emotion+"</font>");
						}
						else if (emotion == "neutral"){
							res.write("color='gray'> #"+emotion+"</font>");
						}
						res.write("</td></tr>")
					}
					res.write("</table></body></html>");
					res.end();
				});
			} else {
				res.writeHead("ERROR");
				res.end("<html><head><title>ERROR</title></head><body><h1>PROBLEM</h1></body></html>");
			}
			break;
		default:
			fs.readFile('./index.html', function(err, html) {
				if (err) {
					throw err;
				}
				res.writeHead(200, "OK", { "Content-Type": "text/html; charset=utf-8" });
				res.write(html);
				res.end();
			})
		};
	}).listen(8080);
}

function main() {
	loadComments();
	loadWebPage();
}

main();
	