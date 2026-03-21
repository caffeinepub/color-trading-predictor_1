import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat8 "mo:core/Nat8";

actor {
  type ColorSignal = {
    #red;
    #green;
    #violet;
  };

  type Prediction = {
    inputNumber : Nat8;
    result : Bool; // true for BIG, false for SMALL
    luckyNumbers : [Nat8];
    colorSignal : ColorSignal;
    timestamp : Time.Time;
  };

  let predictions = List.empty<Prediction>();

  var predictionCount = 0;

  func determineColorSignal() : ColorSignal {
    switch (predictionCount % 3) {
      case (0) { #red };
      case (1) { #green };
      case (2) { #violet };
      case (_) { #red };
    };
  };

  public shared ({ caller }) func submitPrediction(inputNumber : Nat8) : async () {
    if (inputNumber > 9) {
      Runtime.trap("Input number must be between 0 and 9");
    };

    let result = inputNumber <= 4;
    let luckyNumber1 = Nat8.fromIntWrap(
      do {
        let remainder = Time.now() % 10;
        if (remainder < 0) { 0 } else { remainder };
      }
    );
    let luckyNumber2 = Nat8.fromIntWrap(
      do {
        let remainder = (Time.now() / 3) % 10;
        if (remainder < 0) { 0 } else { remainder };
      }
    );
    let colorSignal = determineColorSignal();
    let timestamp = Time.now();

    let prediction : Prediction = {
      inputNumber;
      result;
      luckyNumbers = [luckyNumber1, luckyNumber2];
      colorSignal;
      timestamp;
    };

    predictions.add(prediction);
    predictionCount += 1;
  };

  public query ({ caller }) func getLast20Records() : async [Prediction] {
    let size = predictions.size();
    if (size == 0) {
      return [];
    };

    let array = predictions.toArray();
    let sortedArray = array.reverse();
    let end = if (size < 20) { size } else { 20 };
    sortedArray.sliceToArray(0, end);
  };
};
