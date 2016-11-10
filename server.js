var http = require('http')
  , fs   = require('fs')
  , url  = require('url')
  , qs = require('querystring')
  , port = 8080

var server = http.createServer( function (req, res) {

  var uri = url.parse(req.url)
  var movies = 
    fs.readFileSync('movies.txt', 'utf8')
      .toString()
      .trim()
      .split("\n");
  switch( uri.pathname ) {
    // Note the new case handling search
    case '/search':
      handleSearch(res, uri, movies)
      break
    // Note we no longer have an index.html file, but we handle the cases since that's what the browser will request
    case '/':
      writeMovies(req, res, movies)
      break
    case '/index.html':
      writeMovies(req, res, movies)
      break
    case '/README.md':
      sendFile(res, 'README.md', 'text/x-markdown')
      break
    case '/css/style.css':
      sendFile(res, 'style.css', 'text/css')
      break
    case '/js/scripts.js':
      sendFile(res, 'scripts.js', 'text/javascript')
      break
    default:
      res.end('404 not found')
  }

})


server.listen(process.env.PORT || port)
console.log('listening on 8080')

function writeMovies(req, res, movies) {
  // read movies file
  

  // handle POST to update file
  var d = '';
  req.on('data', function(c) {
    d = d+c
  })
  req.on('end', function() {
    if(d != '') {
      var q = qs.parse(d)
      if(q.newmovie) {
        movies.push( q.newmovie )
        fs.writeFileSync('movies.txt', movies.join('\n'))
      }
      if(q.deletemovie) {
        i = movies.indexOf( q.deletemovie )
        if (i > -1) {
          movies.splice(i, 1)
          fs.writeFileSync('movies.txt', movies.join('\n'))
        }
      }
    }
    d = ''
  })
  res.writeHead(200, {"Content-Type": "text/html"});

  res.write("<html>");
  res.write("<head>");
  res.write('<link rel="stylesheet" type="text/css" href="css/style.css"/>');
  res.write('<link href="https://fonts.googleapis.com/css?family=Itim" rel="stylesheet">');
  res.write('<script src="https://use.fontawesome.com/53f66de2be.js"></script>');
  res.write('</head>');
  res.write("<body>");

  res.write("<h2>My current movies are:</h2>");
  movies.forEach(function(d) {
    res.write("<p>" + d + "</p>");
  });

  res.write("<form method=\"post\">");
  res.write("<label for=\"newmovie\" > Add New Movie</label>");
  res.write("<input id=\"newmovie\" name=\"newmovie\" type=\"text\">");
  res.write("<label for=\"deletemovie\" > Remove a Movie</label>");
  res.write("<input id=\"deletemovie\" name=\"deletemovie\" type=\"text\">");
  res.write("<button id='file_submit' type=\"submit\">Submit</button>")
  res.write("<br>")
  res.write("<br>")
  res.write("<a href='/search'>Click Here to Search Movies!</a>")
  res.write("</form>");


  res.write("</body>");
  res.write("</html>");
  res.end();
}; 
server.listen(8088);
console.log("Server is listening on 8088");

// You'll be modifying this function
function handleSearch(res, uri, movies) {
  var contentType = 'text/html'
  res.writeHead(200, {'Content-type': contentType})

  if(uri.query) {
    // PROCESS THIS QUERY TO FILTER MOVIES ARRAY BASED ON THE USER INPUT
    console.log( uri.query )
    data = qs.parse( uri.query )
    results = []
    for (var movie of movies) {
      if (movie.toLowerCase().indexOf(data.search.toLowerCase()) !== -1) {
        results.push(movie);
      };
    }
    res.end( createHTML(results) )
  } else {
    res.end( createHTML(movies) )
  }
}

function sendIndex(res) {
  var contentType = 'text/html'
    , html = createHTML(movies)
  
  res.writeHead(200, {'Content-type': contentType})
  res.end(html, 'utf-8')
}

function createHTML(movies) {
  html = ' ' 
  html = html + '<html>'

  html = html + '<head>'
  html = html + '<link rel="stylesheet" type="text/css" href="css/style.css"/>'
  html = html + '<link href="https://fonts.googleapis.com/css?family=Itim" rel="stylesheet">'
  html = html + '<script src="https://use.fontawesome.com/53f66de2be.js"></script>'
  html = html + '</head>'

  html = html + '<body>'
  html = html + '<h1>Movie Search!</h1>'

  html = html + '<form action="search" method="search">'
  html = html + '<input type="text" id="search" name="search" />'
  html = html + '<button id="search_btn" type="submit"><i class="fa fa-search fa-lg fw"></i></button>'
  html = html + "<br>"
  html = html + "<br>"
  html =  html + '<a href="/">Click Here to Add or Delete Movies!</a>'
  html = html + '</form>'

  html = html + '<ul>'
  // Note: the next line is fairly complex. 
  // You don't need to understand it to complete the assignment,
  // but the `map` function and `join` functions are VERY useful for working
  // with arrays, so I encourage you to tinker with the line below
  // and read up on the functions it uses.
  //
  // For a challenge, try rewriting this function to take the filtered movies list as a parameter, to avoid changing to a page that lists only movies.
  if (movies.length === 0) {
      html = html + '<h2>No Results</h2>'
  }
  else {
    html = html + movies.map(function(d) { return '<li>'+d+'</li>' }).join(' ')
  }
  html = html + '</ul>'

  html = html + '</body>'
  html = html + '</html>'
  return html
}

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html'

  fs.readFile(filename, function(error, content) {
    res.writeHead(200, {'Content-type': contentType})
    res.end(content, 'utf-8')
  })

}