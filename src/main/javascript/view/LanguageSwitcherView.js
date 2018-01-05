'use strict';

SwaggerUi.Views.LanguageSwitcherView = Backbone.View.extend({

  events: {
    'click .language-button': 'clickLanguageButton'
  },

  initialize: function() {
    window.onscroll = this.onScroll.bind(this);
    this.onScroll();
    this.model.bind('change', this.render.bind(this));
  },

  clickLanguageButton: function (e) {
    var clickedEl = $(e.target);
    this.model.set('selected', clickedEl.text().toLowerCase())
  },

  render: function(){
    $(this.el).html(Handlebars.templates.language_switcher(this.model.attributes));
    return this;
  }
});