const {
  throttle,
  switchLates,
  distinctUntilChanged,
  takeUntil
} = rxjs.operators;
var Observable = Rx.Observable;
var textbox = document.getElementById("textbox");
var keypresses = Observable.fromEvent(textbox, "keypress");
var results = document.getElementById("results");
var searchButton = document.getElementById("searchButton");
var searchButtonClicks = Observable.fromEvent(searchButton, "click");

// keypresses.forEach(keypress => console.log(keypress));

// function searchWikipedia(term) {
//   var url =
//     "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
//     encodeURIComponent(term) +
//     "&callback=?";
//   $.getJSON(url, function(data) {
//     console.log(data);
//   });
// }

searchButtonClicks.forEach(function() {
  console.log("hello");

  document.getElementById("searchForm").style.display = "block";
});

function getWikipediaSearchResults(term) {
  return Observable.create(function(obsever) {
    var cancelled = false;
    var url =
      "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
      encodeURIComponent(term) +
      "&callback=?";
    $.getJSON(url, function(data) {
      if (!cancelled) {
        obsever.onNext(data[1]);
        obsever.onCompleted();
      }
    });
    return function dispose() {
      cancelled = true;
    };
  });
}
// searchWikipedia("Terminator");

// getWikipediaSearchResults("Terminator").forEach(result => console.log(result));

//20 seconds
var searchResultsSets = searchButtonClicks
  .map(function() {
    var closeButtonClicks = Observable.fromEvent(
      document.getElementById("closeButton"),
      "click"
    );
    return (
      keypresses
        // {..'a'.....'b'....'c'....'d'...
        .throttle(20)
        //{..............b.............d.......
        .map(key => {
          return textbox.value;
        })
        //{.........'ab'...........'ab'...........'abc'.....
        .distinctUntilChanged()
        //{.........'ab'..........................'abc'.......
        .filter(search => {
          return search.trim().length > 0;
        })
        .map(search => {
          return getWikipediaSearchResults(search).retry(3);
        })
        //{
        // .......{........["aardvark","abacus"]} "we press a first"
        // .............{........................["abacus"]}  "we press b"
        //}
        // merge {.........["aardvark","abacus"]..["abacus"].......    show both (a b), if first much time than second, merge will show the second and then first
        //concat {.........["aardvark","abacus"]........................["abacus"] waiting the first (a)
        //swtich {................................["abacus"]..........} stop listening the first (a)
        .switchLatest()
        .takeUntil(closeButtonClicks)
    );
  })
  .switchLatest();
searchResultsSets.forEach(
  resultSet => {
    results.value = JSON.stringify(resultSet);
  },
  function(error) {
    alert("not working, try again later");
  }
);
