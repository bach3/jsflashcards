var app = (function(cardDeck, Showdown) {
  "use strict";

  var appName = 'Flash Cards',
    version = '0.2',
    cardCount = 0,
    cards = cardDeck.cards,
    cardsLength = cardDeck.cards.length,
    markdownConverter = new Showdown.Converter();

  function shuffle(array) {
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    var counter = array.length, temp, index;
    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter = counter - 1;

      // And swap the last element with it
      temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }
    return array;
  }

  return {
    init: function() {
      cardCount = 0;
      cards = shuffle(cards);
    },
    getNextCard: function() {
      var card;
      if (cardCount !== cardsLength) {
        card = cards[cardCount];
        cardCount = cardCount + 1;
      } else {
        cardCount = 0;
      }
      return card;
    },
    markdownToHTML: function(markdownText) {
      var text = markdownText.replace(new RegExp('\\|', 'g'), '\n');
      return markdownConverter.makeHtml(text);
    },
    loadCards: function(cardfile) {
      var files = cardfile.target.files;
    
      for (var idx = 0,f; f = files[idx]; idx++){
        if (!f.type.match('json.*')){
          alert('Please load json file');
          return;
        }

        var reader = new FileReader();
        reader.onload = (function(theFile){
          return function (e){
            var jsonObj = JSON.parse(e.target.result);//cards contents
            if (jsonObj === undefined){
              alert('Could not load JSON\'s Cards File');
              return;
            }
            //update cardDeck
            cardDeck = jsonObj;
            cards = cardDeck.cards;
            cardsLength = cardDeck.cards.length;

            $('#app-title').text(cardDeck.title);
            $('#app-catch-phrase').text(cardDeck.catchPhrase);
          };
        })(f);
        var rs = reader.readAsText(f);
      }
    },
    getCardTitle: function (){
      return cardDeck.title;
    },
    getCardPhrase: function (){
      return cardDeck.catchPhrase;
    }
  };
})(flashcardDeck, showdown);

/*
 jQueryMobile event handlers
 */
$(document).bind('pageinit', function(event, ui) {
  "use strict";
  app.init();
  $('#app-title').text(app.getCardTitle);
  $('#app-catch-phrase').text(app.getCardPhrase);
});

$(document).delegate("#title-page", "pagecreate", function() {
  "use strict";
  $(this).css('background', '#f0db4f');
  if (navigator.userAgent.match(/Android/i)) {
    window.scrollTo(0, 1);
  }
  $('#btn-load').bind("click",function(event, ui){
    $('#cards-file').trigger('click');  
  });
  $('#cards-file').on("change",app.loadCards);

  $('#cards-file').parent().hide();
});

$(document).delegate("#main-page", "pageinit", function() {
  "use strict";
  function nextCard() {
    $( "#flash-card" ).collapsible( "collapse" );
    var card = app.getNextCard();
    if (card === undefined) {
      window.location.href = '#resources-page';
    } else {
      $('#question').html(app.markdownToHTML(card.question));
      $('#answer').html(app.markdownToHTML(card.answer));
    }
  }

  $("#next-card").bind("click", function(event, ui) {
    nextCard();
  });
  $("#skip-card").bind("click", function(event, ui) {
    nextCard();
  });
  $("#main-page").on("swipeleft", function(event) {
    nextCard();
  });
  $(document).delegate('#main-page', 'pageshow', function() {
    nextCard();
  });
  $(".btn-reset").bind("click", function(event) {
    app.init();
  });
});


