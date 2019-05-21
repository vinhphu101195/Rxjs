var Observable = Rx.Observable;
var textbox = document.getElementById("textbox");
var keypresses = Observable.fromEvent(textbox, "keypress");

keypresses.forEach(keypress => console.log(keypress));

// function searchWikipedia(term) {
//   var url =
//     "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
//     encodeURIComponent(term) +
//     "&callback=?";
//   $.getJSON(url, function(data) {
//     console.log(data);
//   });
// }

function getWikipediaSearchResults(term) {
  return {
    forEach: function(obsever) {
      var url =
        "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
        encodeURIComponent(term) +
        "&callback=?";
      $.getJSON(url, function(data) {
        console.log(data);
      });
    }
  };
}

searchWikipedia("Terminator");
