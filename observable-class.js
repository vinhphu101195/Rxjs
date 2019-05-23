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
