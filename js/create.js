var app = (function(cardDeck) {
  "use strict";

  var appName = 'Flash Cards Manage',
    cards = cardDeck.cards,
    cardsLength = cardDeck.cards.length;

    function input_card(cardItem,index){
      return ""
      +  "<div role=\"main\" class=\"ui-content\"><div class='ui-grid-solo'>"
      +  "<a href=\"#\" name=\"btn_remove_card\" data-value=\""+ index +"\" data-role=\"button\" data-icon=\"delete\" data-iconpos=\"notext\" data-theme=\"b\" data-inline=\"true\""
      +  " onclick=\"app.removeCardBtn(this);\" style=\"float:right;\" >"
      +  "<span class=\"ui-button-icon ui-icon delete\"><\/a>"
      +  "<div class='ui-block-a'>"
      +  " <label for='textarea-q"+ index +"'>Question " + (index + 1) + ":<\/label>"
      +  " <textarea name='textareq"+ index +"' id='textarea-q"+ index +"' style=\"height:50px;\">"
      +  cardItem.question
      +  "<\/textarea>"
      +  " <label for='textarea-a"+ index +"'>Answer:<\/label>"
      +  " <textarea name='textarea"+ index +"' id='textarea-a"+ index +"' style=\"height:100px;\">"
      +  cardItem.answer
      +  "<\/textarea>"
      +  "<\/div>"
      +  "<\/div><\/div>"
      +  "<hr/>";
    }
  return {
    init: function() {
      var output ="";
      if (cardsLength == 0 || cardsLength === undefined ){
        //do nothing
      } else {
        for (var idx = 0; idx < cardsLength; idx++){
          output += input_card(cards[idx],idx);
        }
      }
      $('#cards-content').html(output);
      $('#cards-content').trigger('create');
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
            var jsonObj = JSON.parse(e.target.result);
            if (jsonObj === undefined){
              alert('Could not load JSON\'s Cards File');
              return;
            }
            cardDeck = jsonObj;
            cards = cardDeck.cards;
            cardsLength = cardDeck.cards.length;
            $('#app-title').text(cardDeck.title);
            $('#app-catch-phrase').text(cardDeck.catchPhrase);
            $('#cards_number').val(cardsLength);

            app.init();
          };
        })(f);
        var rs = reader.readAsText(f);
      }
    },
    backupCards: function() {
      var filename = 'Cards.json';
      var text = JSON.stringify(cardDeck);
      
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/flain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },
    saveCards: function() {
      var cardsObj = [];
      var cardsContent = $('#cards-content');
      var cardsTitle = $('#app-title').val();
      var cardsCatchPhrase = $('#app-catch-phrase').val();
      if (cardsTitle){
        cardDeck.title = cardsTitle;
      }

      if (cardsCatchPhrase){
        cardDeck.catchPhrase = cardsCatchPhrase;
      }

      $.each(cardsContent.children('.ui-content'), function(index){
        var question = $("div.ui-block-a > textarea[name*='textareq"+ index +"']").val();
        var answer = $("div.ui-block-a > textarea[name*='textarea"+ index +"']").val();
        var card = {"question":question,"answer":answer};
        cardsObj.push(card);
      });
      if (cardsObj.length == 0 || cardsObj === undefined){
        //do nothing
      } else {
        cardDeck.cards = cardsObj;
      }
    },
    addCard: function() {
      cardsLength = cardsLength + 1;
      var card = {"question":"","answer":""};
      cardDeck.cards.push(card);
      cards = cardDeck.cards;
    },
    removeCard: function(target) {
      cardsLength = cardsLength - 1;
      if (cardsLength == 0){
        cardDeck.cards.pop();
      } else {
        cardDeck.cards.splice(target,1);
      }
      cards = cardDeck.cards;
    },
    removeCardBtn: function(obj) {
      app.saveCards();
      var target = $(obj).data('value');
      app.removeCard(target);
      app.init();
      
    }
  };
})(flashcardDeck);

/*
 jQueryMobile event handlers
 */
$(document).delegate("#main-page",'pageinit', function(event, ui) {
  "use strict";
  $('#app-title').text(flashcardDeck.title);
  $('#app-catch-phrase').text(flashcardDeck.catchPhrase);
  $('#cards_number').val(flashcardDeck.cards.length);
  $('#cards_file').parent().hide();

  $('#btn_save').bind('click',app.saveCards);

  $('#btn_load').bind('click',function(){
    $('#cards_file').trigger('click');  
  });
  $('#cards_file').bind('change',app.loadCards);

  $('#btn_download').bind('click',app.backupCards);

  $('#btn_add_card').bind('click',function(){
    app.saveCards();
    app.addCard();
    app.init();
    $('#btn_bottom_page').trigger("click");
  });

  $('#btn_top_page').bind('click',function(event, ui){
    $.mobile.silentScroll(0);
  });

  $('#btn_bottom_page').bind('click',function(event, ui){
    var docY = $( document ).height();
    $.mobile.silentScroll(docY);
  });
});
