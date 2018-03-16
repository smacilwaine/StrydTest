let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');
let http = require('http');

http.createServer(function (req, res) {
	fs.readFile('index.html', function(err, data) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		axios.get('https://www.dcrainmaker.com/2015/01/stryd-first-running.html')
			.then((response) => {
				if (response.status === 200) {
					const html = response.data;
					const $ = cheerio.load(html);
					let list = [];
					var num = 0;
					$('.comment-body').each(function(i, elem) {
						$(this).prepend('<div class="special"></div>');
						$(this).find('p').append('<p> </p>');
						$(this).find('p').appendTo('.special'); //clone and append trimmed text to fulltext
						list[i] = $(this).find('.special').text().trim();
						num = num+1;
					});
					console.log(list);
					console.log(num+" TOTAL COMMENTS");
			}
		}, (error) => console.log(err) );
		res.end();
	})
}).listen(8080);