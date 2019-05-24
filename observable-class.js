function Observable(forEach) {
  this._forEach = forEach;
}

Observable.prototype = {
  forEach: function(onNext, onError, onCompleted) {
    if (typeof onNext === "function") {
      return this._forEach({
        onNext: onNext,
        onError: onError || function() {},
        onCompleted: onCompleted || function() {}
      });
    } else {
      return this._forEach(onNext);
    }
  },

  map: function(projectionFunction) {
    var self = this;
    //mapped observable
    return new Observable(function forEach(observer) {
      // self here is forEach above
      return self.forEach(
        function onNext(x) {
          observer.onNext(projectionFunction(x));
        },
        function onError(e) {
          observer.onError(e);
        },
        function onCompleted() {
          observer.onCompleted();
        }
      );
    });
  },

  filter: function(testFunction) {
    var self = this;
    //filter observable
    return new Observable(function forEach(observer) {
      // self here is forEach above
      return self.forEach(
        function onNext(x) {
          if (testFunction(x)) {
            observer.onNext(x);
          }
        },
        function onError(e) {
          observer.onError(e);
        },
        function onCompleted() {
          observer.onCompleted();
        }
      );
    });
  },

  take: function(num) {
    var self = this;
    //take observable
    return new Observable(function forEach(observer) {
      var counter = 0,
        subscription = self.forEach(
          function onNext(v) {
            observer.onNext(v);
            counter++;
            if (counter === num) {
              observer.onCompleted();
              subscription.dispose();
            }
          },
          function onError(e) {
            observer.onError(e);
          },
          function onCompleted() {
            observer.onCompleted();
          }
        );
      return subscription;
    });
  }
};

Observable.fromEvent = function(dom, eventName) {
  return new Observable(function forEach(observer) {
    var handler = e => observer.onNext(e);

    dom.addEventListener(eventName, handler);

    //Subscription
    return {
      dispose: () => {
        dom.removeEventListener(eventName, handler);
      }
    };
  });
};

Observable.fromObservations = function(obj) {
  return new Observable(function forEach(obsever) {
    var handler = e => obsever.onNext(e);

    Object.observe(obj, handler);

    //Subscription
    return {
      dispose: () => {
        Object.unobserve(obj, handler);
      }
    };
  });
};

var button = document.getElementById("button");

// var clicks = Observable.fromEvent(button, "click")
//   .filter(e => e.pageX > 35)
//   .map(e => e.pageX + "px");

// clicks.forEach(x => {
//   console.log(x);
// });

// var person = { name: "Phu" };

// Observable.fromObservations(person).forEach(changes => {
//   console.log(changes);
// });

// person.name = "Chau";
// person.age = 24;

// in Rxjs
var Observable = Rx.Observable;

Observable.observations = function(obj) {
  return Observable.create(function forEach(observer) {
    var handler = e => {
      observer.onNext(e);
    };
    Object.observe(obj, handler);

    //subcription
    return function dispose() {
      Object.unobserve(obj, handler);
    };
  });
};

var person = { name: "Jim" };

Observable.observations(person).forEach(x => console.log(x));

person.age = 24;
