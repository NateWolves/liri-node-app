

const fs = require("fs");
require("dotenv").config();
const keys = require("./keys.js");
const axios = require("axios");
var Spotify = require("node-spotify-api");
const moment = require('moment');

let spotify = new Spotify(keys.spotify);

const nodeArgs = process.argv;

const searchType = process.argv[2];
let movieName = "";
let songName = "";
let artist = "";




const concertSearch = function(URL){
// Searches bands in town for concert data
axios.get(URL).then(function(response){
    let r = response.data;
    let result = 
    "\nVenue: " + r[0].venue.name +
    "\nLocation: "+ r[0].venue.city+ ", " + r[0].venue.country +
    "\nDate: "+ moment(r[0].datetime).format('dddd, MMMM Do YYYY');

    console.log(result);
    // Logging our search results to a text file.
    fs.appendFile("log.txt", result, function(err) {
        // If an error was experienced we will log it.
        if (err) {
          console.log(err);
        }     
        // If no error is experienced, we'll log the phrase "Content Added" to our node console.
        else {
          console.log("Content Added!");
        }
      
      });
});
};

const spotifySearch = function(song){
spotify
.search({ type:'track', query: song})
.then(function(response){
let album = response.tracks.items[0].album.name;
let artists = response.tracks.items[0].artists[0].name;
let title = response.tracks.items[0].name;
let songLink = response.tracks.items[0].external_urls.spotify;
let result = `
Song Title: ${title},
Artist(s): ${artists},
Album: ${album},
Link: ${songLink}
.....................................`;
console.log(result);

//   writing our results to a log text file
  fs.appendFile("log.txt", result, function(err) {
    // If an error was experienced we will log it.
    if (err) {
      console.log(err);
    }     
    // If no error is experienced, we'll log the phrase "Content Added" to our node console.
    else {
      console.log("Content Added!");
    }
    });
})
.catch(function(err){
    console.log(err);
});
};


const movieSearch = function(URL){
// Search through OMDB for movie information
axios.get(URL).then(
    function(response){
        let r = response.data;
        let searchResult = `
        Title: ${r.Title},
        Year: ${r.Year},
        Ratings: IMDB = ${r.imdbRating},
                 Rotten Tomatoes = ${r.Ratings[1].Value},
        Country: ${r.Country},
        Language: ${r.Language},
        Plot: ${r.Plot},
        Actors: ${r.Actors}
        .......................................`;
        console.log(searchResult);
        fs.appendFile("log.txt", searchResult, function(err) {
            // If an error was experienced we will log it.
            if (err) {
              console.log(err);
            }     
            // If no error is experienced, we'll log the phrase "Content Added" to our node console.
            else {
              console.log("Content Added!");
            }
          });
    }
)};

const randomizer = (array) => {
    let randomOdd = Math.floor((Math.random()*array.length)+1)
    if (randomOdd % 2 === 0){
        randomizer()
    } else{ return randomOdd}
 };


// Checking our input command to know which search to run

if (searchType === "concert-this"){
//    collecting arguments to send to bands in town
    for (let i = 3; i < nodeArgs.length; i++) {
        if (i > 3 && i < nodeArgs.length) {
          artist = artist + "+" + nodeArgs[i];
        }
        else {
          artist += nodeArgs[i];
        }
      };
    let concertURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
    //  searching our collected arguments through bands in town
    concertSearch(concertURL);
} else if (searchType === "spotify-this-song"){
    // Collecting the arguments to send to spotify
    for (let i = 3; i < nodeArgs.length; i++) {
        if (i > 3 && i < nodeArgs.length) {
          songName = songName + " " + nodeArgs[i];
        }
        else {
          songName += nodeArgs[i];
        }
      };
    // Searches through spotify for a song 
    spotifySearch(songName);
} else if (searchType === "movie-this"){
    // Collecting the argurment
    for (let i = 3; i < nodeArgs.length; i++) {
        if (i > 3 && i < nodeArgs.length) {
          movieName = movieName + "+" + nodeArgs[i];
        }
        else { 
          movieName += nodeArgs[i];
        }
      };
      let movieURL = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
      // run the open movie database function
      movieSearch(movieURL);
} else if(searchType === "do-what-it-says"){
   // Looks in to our random.txt for a random search
    fs.readFile("random.txt", "utf8", function(error, data){
        if (error){
            return console.log(error);
        }
        let d = data;
        let dataArr = d.split(",");
        let random = randomizer(dataArr);

       if (dataArr[random - 1]==="concert-this"){
        let concertURL = "https://rest.bandsintown.com/artists/" + dataArr[random] + "/events?app_id=codingbootcamp";
        //  searching our collected arguments through bands in town
        concertSearch(concertURL);
       } else if (dataArr[random - 1]==="spotify-this-song"){
            spotifySearch(dataArr[random]);
       }else if (dataArr[random - 1]==="movie-this"){
        let movieURL = "http://www.omdbapi.com/?t=" + dataArr[random] + "&y=&plot=short&apikey=trilogy";
        // run the open movie database function
        movieSearch(movieURL);        
       }
    })
 } else {
     console.log(`Please input one of the following:
     "concert-this" to search for an artists upcoming performance.
     "spotify-this-song" to search Spotify for information on a song.
     "movie-this" to search Open Movie Database for information on a movie.
     "do-what-it-says" to receive a random suggestion`)
 };

